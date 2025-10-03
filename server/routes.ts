import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import { storage } from "./storage";
import { imageUploadSchema, base64ImageSchema, urlImageSchema } from "@shared/schema";
import { z } from "zod";
import sharp from "sharp";
import fetch from "node-fetch";
import { promises as dns } from "dns";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('New WebSocket client connected');
    
    // Send current image if available
    storage.getCurrentImage().then(currentImage => {
      if (currentImage && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'image_update',
          data: currentImage
        }));
      }
    });
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log('WebSocket client disconnected');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });
  
  // Broadcast image update to all connected clients
  const broadcastImageUpdate = (image: any) => {
    const message = JSON.stringify({
      type: 'image_update',
      data: image
    });
    
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // Helper function to check if a string is a valid IPv4 address
  const isIPv4 = (str: string): boolean => {
    const parts = str.split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255 && part === num.toString();
    });
  };

  // Helper function to check if an IP is private/internal
  const isPrivateIP = (ip: string): boolean => {
    // IPv4 checks
    if (isIPv4(ip)) {
      const parts = ip.split('.').map(Number);
      
      // Loopback (127.0.0.0/8)
      if (parts[0] === 127) return true;
      
      // Private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
      if (parts[0] === 10) return true;
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      if (parts[0] === 192 && parts[1] === 168) return true;
      
      // Link-local (169.254.0.0/16)
      if (parts[0] === 169 && parts[1] === 254) return true;
      
      // 0.0.0.0/8
      if (parts[0] === 0) return true;
      
      return false;
    }
    
    // IPv6 checks
    const ipLower = ip.toLowerCase();
    
    // Loopback (::1)
    if (ipLower === '::1' || ipLower === '[::1]') return true;
    
    // Private ranges (fc00::/7, fe80::/10)
    if (ipLower.startsWith('fc') || ipLower.startsWith('fd')) return true;
    if (ipLower.startsWith('fe80:')) return true;
    
    // IPv4-mapped IPv6 (::ffff:...)
    if (ipLower.includes('::ffff:')) return true;
    
    return false;
  };

  // Helper function to validate URL with DNS resolution (SSRF protection)
  const validateImageUrl = async (urlString: string): Promise<{ valid: boolean; error?: string }> => {
    try {
      const url = new URL(urlString);
      
      // Only allow HTTP/HTTPS protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        return { valid: false, error: 'Only HTTP and HTTPS protocols are allowed' };
      }
      
      const hostname = url.hostname.toLowerCase();
      
      // Block obvious localhost references
      if (hostname === 'localhost' || hostname === '0.0.0.0') {
        return { valid: false, error: 'Localhost URLs are not allowed' };
      }
      
      // Check if hostname is already an IP address
      if (isPrivateIP(hostname)) {
        return { valid: false, error: 'Private IP addresses are not allowed' };
      }
      
      // Use dns.lookup to resolve hostname (handles all IPv4 notations including shorthand)
      try {
        const lookupResult = await dns.lookup(hostname, { all: true }).catch(() => [] as Array<{ address: string; family: number }>);
        
        if (lookupResult.length === 0) {
          return { valid: false, error: 'Failed to resolve hostname' };
        }
        
        // Check all resolved addresses
        for (const result of lookupResult) {
          if (isPrivateIP(result.address)) {
            return { valid: false, error: 'URL resolves to a private IP address' };
          }
        }
      } catch (dnsError) {
        return { valid: false, error: 'Failed to resolve hostname' };
      }
      
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  };

  // Helper function to get image metadata
  const getImageMetadata = async (buffer: Buffer) => {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: buffer.length,
      };
    } catch (error) {
      console.error('Error getting image metadata:', error);
      return {
        width: undefined,
        height: undefined,
        format: 'unknown',
        size: buffer.length,
      };
    }
  };

  // API route for JSON image uploads (base64 and URL)
  app.post('/api/v1/image/upload', async (req, res) => {
    try {
      const validatedData = imageUploadSchema.parse(req.body);
      
      let imageBuffer: Buffer;
      let filename: string;
      let format: string;
      
      if (validatedData.type === 'base64') {
        // Handle base64 image
        const base64Data = validatedData.data.replace(/^data:image\/[a-z]+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
        filename = validatedData.metadata?.filename || 'base64-image';
        format = validatedData.metadata?.format || 'unknown';
      } else {
        // Handle URL image - validate URL first for SSRF protection
        const validation = await validateImageUrl(validatedData.url);
        if (!validation.valid) {
          return res.status(400).json({ 
            success: false, 
            message: validation.error || 'Invalid URL' 
          });
        }
        
        const response = await fetch(validatedData.url, {
          headers: {
            'User-Agent': 'ImageDisplayBot/1.0',
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
        
        if (!response.ok) {
          return res.status(400).json({ 
            success: false, 
            message: 'Failed to fetch image from URL' 
          });
        }
        
        // Verify content-type is an image
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
          return res.status(400).json({ 
            success: false, 
            message: 'URL does not point to an image (invalid content-type)' 
          });
        }
        
        // Check content-length if available (10MB limit)
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
          return res.status(400).json({ 
            success: false, 
            message: 'Image too large (max 10MB)' 
          });
        }
        
        const arrayBuffer = await response.arrayBuffer();
        
        // Double-check size after download
        if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
          return res.status(400).json({ 
            success: false, 
            message: 'Image too large (max 10MB)' 
          });
        }
        
        imageBuffer = Buffer.from(arrayBuffer);
        filename = validatedData.url.split('/').pop() || 'url-image';
        format = contentType.split('/')[1] || 'unknown';
      }
      
      // Get image metadata
      const metadata = await getImageMetadata(imageBuffer);
      
      // Convert to base64 for storage
      const base64String = `data:image/${metadata.format};base64,${imageBuffer.toString('base64')}`;
      
      // Store image
      const storedImage = await storage.storeImage({
        type: validatedData.type,
        data: base64String,
        filename,
        format: metadata.format || format,
        width: metadata.width,
        height: metadata.height,
        size: metadata.size,
      });
      
      // Broadcast update to WebSocket clients
      broadcastImageUpdate(storedImage);
      
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          id: storedImage.id,
          dimensions: {
            width: storedImage.width,
            height: storedImage.height,
          },
          format: storedImage.format,
          size: storedImage.size,
          timestamp: storedImage.uploadedAt.toISOString(),
        }
      });
    } catch (error) {
      console.error('Image upload error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request format',
          errors: error.errors,
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  });

  // API route for multipart form uploads
  app.post('/api/v1/image/upload/multipart', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
      }

      const imageBuffer = req.file.buffer;
      const metadata = await getImageMetadata(imageBuffer);
      
      // Convert to base64 for storage
      const base64String = `data:image/${metadata.format};base64,${imageBuffer.toString('base64')}`;
      
      // Parse additional metadata if provided
      let additionalMetadata = {};
      if (req.body.metadata) {
        try {
          additionalMetadata = JSON.parse(req.body.metadata);
        } catch (e) {
          // Ignore invalid metadata
        }
      }
      
      // Store image
      const storedImage = await storage.storeImage({
        type: 'upload',
        data: base64String,
        filename: req.file.originalname,
        format: metadata.format || req.file.mimetype.split('/')[1],
        width: metadata.width,
        height: metadata.height,
        size: metadata.size,
      });
      
      // Broadcast update to WebSocket clients
      broadcastImageUpdate(storedImage);
      
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          id: storedImage.id,
          dimensions: {
            width: storedImage.width,
            height: storedImage.height,
          },
          format: storedImage.format,
          size: storedImage.size,
          timestamp: storedImage.uploadedAt.toISOString(),
        }
      });
    } catch (error) {
      console.error('Multipart upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  });

  // Get current image
  app.get('/api/v1/image/current', async (req, res) => {
    try {
      const currentImage = await storage.getCurrentImage();
      
      if (!currentImage) {
        return res.status(404).json({
          success: false,
          message: 'No image available',
        });
      }
      
      res.json({
        success: true,
        data: currentImage,
      });
    } catch (error) {
      console.error('Get current image error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  });

  return httpServer;
}
