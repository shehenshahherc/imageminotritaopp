import { useState } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { Button } from '@/components/ui/button';
import { Download, Copy, Trash2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ImageDisplay() {
  const { currentImage } = useWebSocket();
  const { toast } = useToast();
  const [imageLoading, setImageLoading] = useState(false);
  
  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };
  
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleString();
  };
  
  const handleDownload = () => {
    if (!currentImage?.data) return;
    
    try {
      const link = document.createElement('a');
      link.href = currentImage.data;
      link.download = currentImage.filename || `image.${currentImage.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: "Image download has been initiated.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the image.",
        variant: "destructive",
      });
    }
  };
  
  const handleCopyUrl = async () => {
    if (!currentImage?.data) return;
    
    try {
      await navigator.clipboard.writeText(currentImage.data);
      toast({
        title: "URL copied",
        description: "Image URL has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive",
      });
    }
  };
  
  const handleClear = () => {
    // In a real implementation, this would call an API to clear the current image
    toast({
      title: "Clear image",
      description: "Image clearing is not implemented in this demo.",
    });
  };
  
  return (
    <section className="mb-8">
      <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
        
        {/* Image Metadata Bar */}
        <div className="px-6 py-3 bg-muted border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Last Updated:</span>
            <span className="text-sm font-medium text-foreground" data-testid="text-last-updated">
              {currentImage?.uploadedAt ? formatDate(currentImage.uploadedAt) : 'Never'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Format:</span>
              <span className="text-sm font-medium text-foreground" data-testid="text-image-format">
                {currentImage?.format?.toUpperCase() || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Size:</span>
              <span className="text-sm font-medium text-foreground" data-testid="text-image-size">
                {currentImage?.width && currentImage?.height 
                  ? `${currentImage.width} × ${currentImage.height}` 
                  : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Image Display Container */}
        <div className="image-container p-8 min-h-[500px] flex items-center justify-center relative">
          {currentImage?.data ? (
            <img 
              src={currentImage.data}
              alt="Currently displayed image" 
              className="max-w-full max-h-[600px] w-auto h-auto object-contain rounded-lg shadow-2xl fade-in"
              onLoad={() => setImageLoading(false)}
              onLoadStart={() => setImageLoading(true)}
              data-testid="img-current-image"
            />
          ) : (
            <div className="text-center" data-testid="text-no-image">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Image Available</h3>
              <p className="text-muted-foreground">Upload an image through the API to see it here</p>
            </div>
          )}
          
          {/* Loading State */}
          {imageLoading && (
            <div className="absolute inset-0 bg-muted/50 flex items-center justify-center" data-testid="loading-image">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading image...</p>
              </div>
            </div>
          )}
        </div>

        {/* Image Actions */}
        <div className="px-6 py-4 bg-muted border-t border-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={handleDownload}
              disabled={!currentImage?.data}
              data-testid="button-download"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCopyUrl}
              disabled={!currentImage?.data}
              data-testid="button-copy-url"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy URL
            </Button>
          </div>
          <Button 
            variant="destructive" 
            onClick={handleClear}
            disabled={!currentImage?.data}
            data-testid="button-clear"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>
    </section>
  );
}
