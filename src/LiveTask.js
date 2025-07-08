import { EventEmitter } from 'events';
import WebSocket from 'ws';

class LiveTask extends EventEmitter {
  constructor(websocketUrl) {
    super();
    this.websocketUrl = websocketUrl;
    this.ws = null;
    this._connect();
  }

  _connect() {
    this.ws = new WebSocket(this.websocketUrl);

    this.ws.on('open', () => {
      this.emit('open');
    });

    this.ws.on('message', (data) => {
      try {
        const event = JSON.parse(data.toString());
        this.emit(event.type, event.payload); // Emit specific event type
        this.emit('event', event); // Emit a generic event
      } catch (error) {
        this.emit('error', new Error('Failed to parse event data from WebSocket.'));
      }
    });

    this.ws.on('close', () => {
      this.emit('close');
    });

    this.ws.on('error', (error) => {
      this.emit('error', error);
    });
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export default LiveTask;