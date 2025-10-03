import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Server, FileCode, Terminal, CheckCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ApiDocs() {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();
  
  const copyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };
  
  const endpoint = `${window.location.origin}/api/v1/image/upload`;
  const multipartEndpoint = `${window.location.origin}/api/v1/image/upload/multipart`;
  
  const base64Example = `{
  "type": "base64",
  "data": "iVBORw0KGgoAAAANSUhEUgAA...",
  "metadata": {
    "filename": "image.jpg",
    "format": "jpeg"
  }
}`;

  const urlExample = `{
  "type": "url",
  "url": "https://example.com/image.jpg",
  "metadata": {
    "source": "external"
  }
}`;

  const curlExample = `curl -X POST ${multipartEndpoint} \\
  -H "Content-Type: multipart/form-data" \\
  -F "image=@/path/to/image.jpg" \\
  -F "metadata={\\"source\\":\\"upload\\"}`;

  const responseExample = `{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "id": "img_123456789",
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "format": "jpeg",
    "size": 245760,
    "timestamp": "2024-01-15T14:32:18Z"
  }
}`;

  if (!isVisible) {
    return (
      <Button 
        onClick={() => setIsVisible(true)}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2"
        data-testid="button-show-api-docs"
      >
        <Terminal className="h-4 w-4" />
        <span>API Docs</span>
      </Button>
    );
  }
  
  return (
    <>
      {/* API Docs Toggle Button */}
      <Button 
        onClick={() => setIsVisible(!isVisible)}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2"
        data-testid="button-toggle-api-docs"
      >
        <Terminal className="h-4 w-4" />
        <span>API Docs</span>
      </Button>
      
      {/* API Documentation Section */}
      <section className="mb-8">
        <Card className="shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Terminal className="h-6 w-6" />
                <CardTitle className="text-lg font-bold">API Documentation</CardTitle>
              </div>
              <Badge variant="secondary">v1.0</Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            
            {/* Endpoint Information */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center space-x-2">
                <Server className="h-5 w-5 text-primary" />
                <span>Endpoints</span>
              </h3>
              <div className="space-y-3">
                <div className="bg-muted rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-mono text-foreground" data-testid="text-json-endpoint">
                      POST {endpoint}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(endpoint, "JSON endpoint copied to clipboard")}
                      data-testid="button-copy-json-endpoint"
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">For Base64 and URL image uploads</p>
                </div>
                
                <div className="bg-muted rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-mono text-foreground" data-testid="text-multipart-endpoint">
                      POST {multipartEndpoint}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(multipartEndpoint, "Multipart endpoint copied to clipboard")}
                      data-testid="button-copy-multipart-endpoint"
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">For multipart form data uploads</p>
                </div>
              </div>
            </div>

            {/* Supported Formats */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center space-x-2">
                <FileCode className="h-5 w-5 text-primary" />
                <span>Supported Formats</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-accent rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileCode className="h-4 w-4 text-accent-foreground" />
                    <span className="font-semibold text-accent-foreground">Base64</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Encoded string format</p>
                </div>
                <div className="bg-accent rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Terminal className="h-4 w-4 text-accent-foreground" />
                    <span className="font-semibold text-accent-foreground">URL</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Direct image URL</p>
                </div>
                <div className="bg-accent rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Server className="h-4 w-4 text-accent-foreground" />
                    <span className="font-semibold text-accent-foreground">Multipart</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Form data upload</p>
                </div>
              </div>
            </div>

            {/* Code Examples */}
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center space-x-2">
                <Terminal className="h-5 w-5 text-primary" />
                <span>Usage Examples</span>
              </h3>
              
              <Tabs defaultValue="base64" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="base64">Base64</TabsTrigger>
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                </TabsList>
                
                <TabsContent value="base64">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Base64 Format</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(base64Example, "Base64 example copied to clipboard")}
                      data-testid="button-copy-base64-example"
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                  <div className="code-block p-4 overflow-x-auto rounded-lg bg-slate-900 text-slate-100">
                    <pre className="text-sm"><code>{base64Example}</code></pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="url">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">URL Format</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(urlExample, "URL example copied to clipboard")}
                      data-testid="button-copy-url-example"
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                  <div className="code-block p-4 overflow-x-auto rounded-lg bg-slate-900 text-slate-100">
                    <pre className="text-sm"><code>{urlExample}</code></pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="curl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">cURL Example (Multipart)</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(curlExample, "cURL example copied to clipboard")}
                      data-testid="button-copy-curl-example"
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                  <div className="code-block p-4 overflow-x-auto rounded-lg bg-slate-900 text-slate-100">
                    <pre className="text-sm"><code>{curlExample}</code></pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="response">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Success Response</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(responseExample, "Response example copied to clipboard")}
                      data-testid="button-copy-response-example"
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                  </div>
                  <div className="code-block p-4 overflow-x-auto rounded-lg bg-slate-900 text-slate-100">
                    <pre className="text-sm"><code>{responseExample}</code></pre>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Important Notes */}
            <div className="bg-muted rounded-lg p-4 border border-border">
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center space-x-2">
                <Info className="h-5 w-5 text-primary" />
                <span>Important Notes</span>
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                  <span>Maximum file size: 10MB</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                  <span>Supported formats: JPEG, PNG, GIF, WebP</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                  <span>Images are automatically displayed in real-time on all connected clients</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                  <span>WebSocket connection provides real-time updates</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
