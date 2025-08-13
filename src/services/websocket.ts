type MessageHandler = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(url: string) {
    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.socket.onclose = () => {
        console.log("WebSocket disconnected");
        this.attemptReconnect(url);
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  }

  private handleMessage(data: any) {
    const { type, payload } = data;
    const handlers = this.messageHandlers.get(type) || [];
    handlers.forEach((handler) => handler(payload));
  }

  private attemptReconnect(url: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        this.connect(url);
      }, 1000 * this.reconnectAttempts);
    }
  }

  subscribe(messageType: string, handler: MessageHandler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)?.push(handler);
  }

  unsubscribe(messageType: string, handler: MessageHandler) {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  send(messageType: string, payload: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: messageType, payload }));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const websocketService = new WebSocketService();
