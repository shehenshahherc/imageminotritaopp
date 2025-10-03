import { useWebSocket } from '@/hooks/use-websocket';
import { ConnectionStatus } from '@/components/connection-status';
import { ImageDisplay } from '@/components/image-display';
import { ApiDocs } from '@/components/api-docs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image, Settings, ArrowDown, Clock, Signal } from 'lucide-react';

export default function Home() {
  const { messagesReceived, uptime, lastPing, reconnect } = useWebSocket();
  
  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Image className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Image Display API</h1>
                <p className="text-xs text-muted-foreground">Real-time Image Viewer</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ConnectionStatus />
              <ApiDocs />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Main Image Display Section */}
        <ImageDisplay />

        {/* Connection Settings & Debug */}
        <section>
          <Card className="shadow-lg">
            <div className="px-6 py-4 bg-muted border-b border-border">
              <h2 className="text-lg font-bold text-foreground flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <span>Connection Settings</span>
              </h2>
            </div>
            
            <CardContent className="p-6 space-y-6">
              {/* WebSocket URL Configuration */}
              <div>
                <Label className="text-sm font-medium text-foreground mb-2">WebSocket URL</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="text" 
                    value={`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`}
                    readOnly
                    className="flex-1 font-mono text-sm"
                    data-testid="input-websocket-url"
                  />
                  <Button onClick={reconnect} data-testid="button-reconnect-settings">
                    Reconnect
                  </Button>
                </div>
              </div>

              {/* Connection Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Messages Received</span>
                    <ArrowDown className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-messages-received">
                    {messagesReceived.toLocaleString()}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Uptime</span>
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-uptime">
                    {uptime}
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Last Ping</span>
                    <Signal className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground" data-testid="text-last-ping">
                    {lastPing ? `${lastPing}ms` : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-16 bg-muted border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-3">About</h3>
              <p className="text-sm text-muted-foreground">Real-time image display service with API integration. Built for developers who need instant image visualization.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Code Examples</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">GitHub Repository</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Report Issues</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status Page</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">&copy; 2024 Image Display API. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
