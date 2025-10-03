import { useWebSocket } from '@/hooks/use-websocket';

export function ConnectionStatus() {
  const { connectionStatus, reconnect } = useWebSocket();
  
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-secondary';
      case 'connecting':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-destructive';
      default:
        return 'bg-muted-foreground';
    }
  };
  
  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-secondary/10 rounded-full">
        <span className={`w-2 h-2 ${getStatusColor()} rounded-full pulse-dot`}></span>
        <span className="text-sm font-medium text-secondary" data-testid="connection-status">
          {getStatusText()}
        </span>
      </div>
      
      {connectionStatus === 'disconnected' && (
        <button 
          onClick={reconnect}
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          data-testid="button-reconnect"
        >
          Reconnect
        </button>
      )}
    </div>
  );
}
