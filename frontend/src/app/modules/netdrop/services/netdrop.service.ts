import { Injectable, Inject, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Subject } from 'rxjs';

export interface Peer {
  id: string;
  name: string;
}

export interface FileTransferState {
  fileName: string;
  progress: number; // 0 to 1
  incoming: boolean;
  active: boolean;
}

@Injectable()
export class NetdropService {
  private socket!: Socket;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();

  // State
  public peers$ = new BehaviorSubject<Peer[]>([]);
  public transferState$ = new BehaviorSubject<FileTransferState | null>(null);
  public serverIp$ = new BehaviorSubject<string>('');

  // To handle incoming file chunks
  private receiveBuffer: ArrayBuffer[] = [];
  private receivedSize = 0;
  private currentIncomingFile: { name: string, size: number } | null = null;
  private receivedChunksCount = 0;

  // ICE Servers for local network (usually empty is fine, but adding a public stun just in case)
  private rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' } // Fallback STUN
    ]
  };

  private myName: string;

  constructor(
    @Inject('NETDROP_CONFIG') private config: { serverUrl: string },
    private ngZone: NgZone
  ) {
    this.myName = this.generateName();
  }

  public connect() {
    if (this.socket) return;

    // Connect to the specific namespace
    this.socket = io(this.config.serverUrl + '/netdrop');

    this.socket.on('connect', () => {
      this.socket.emit('join', { name: this.myName });
    });

    this.socket.on('peer-list', (peers: Peer[]) => {
      this.peers$.next(peers);
    });

    this.socket.on('peer-joined', (peer: Peer) => {
      const currentPeers = this.peers$.getValue();
      this.peers$.next([...currentPeers, peer]);
    });

    this.socket.on('peer-left', (peerId: string) => {
      const currentPeers = this.peers$.getValue().filter(p => p.id !== peerId);
      this.peers$.next(currentPeers);
      this.cleanupPeer(peerId);
    });

    this.socket.on('server-info', (data: { ip: string }) => {
      this.serverIp$.next(data.ip);
    });

    // Handle incoming WebRTC signaling
    this.socket.on('signal', async (data: { from: string, signalData: any }) => {
      await this.handleSignal(data.from, data.signalData);
    });
  }

  public rejoin() {
    if (this.socket) {
      if (this.socket.connected) {
        this.socket.emit('join', { name: this.myName });
      } else {
        this.socket.connect();
      }
    } else {
      this.connect();
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.peerConnections.forEach((pc, id) => this.cleanupPeer(id));
    this.peers$.next([]);
  }

  private generateName(): string {
    // Attempt to get user department from localStorage if available in this app
    let dept = 'User';
    try {
      const userData = localStorage.getItem('userData'); // Assuming standard HK auth logic, adjust if needed
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed && parsed.departmentName) dept = parsed.departmentName;
        else if (parsed && parsed.user_name) dept = parsed.user_name;
      }
    } catch (e) { }

    return `${dept}_${Math.floor(Math.random() * 9000) + 1000}`;
  }

  public getMyName(): string {
    return this.myName;
  }

  // ----------- WebRTC Logic -----------

  private createPeerConnection(peerId: string): RTCPeerConnection {
    if (this.peerConnections.has(peerId)) {
      return this.peerConnections.get(peerId)!;
    }

    const pc = new RTCPeerConnection(this.rtcConfig);
    this.peerConnections.set(peerId, pc);

    // Send local ICE candidates to the remote peer
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('signal', {
          to: peerId,
          signalData: { type: 'candidate', candidate: event.candidate }
        });
      }
    };

    // Listen for incoming DataChannels
    pc.ondatachannel = (event) => {
      const receiveChannel = event.channel;
      this.setupDataChannel(receiveChannel, peerId);
    };

    return pc;
  }

  private setupDataChannel(channel: RTCDataChannel, peerId: string) {
    this.dataChannels.set(peerId, channel);

    // We expect ArrayBuffer for files
    channel.binaryType = 'arraybuffer';

    channel.onopen = () => console.log(`DataChannel open with ${peerId}`);
    channel.onclose = () => {
      console.log(`DataChannel closed with ${peerId}`);
      this.cleanupPeer(peerId);
    };

    channel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const meta = JSON.parse(event.data);
          if (meta.type === 'file-start') {
            this.currentIncomingFile = { name: meta.name, size: meta.size };
            this.receiveBuffer = [];
            this.receivedSize = 0;
            this.receivedChunksCount = 0;
            this.ngZone.run(() => {
              this.transferState$.next({ fileName: meta.name, progress: 0, incoming: true, active: true });
            });
          } else if (meta.type === 'file-end') {
            this.saveReceivedFile();
          }
        } catch (e) {
          console.error("Unknown string message", event.data);
        }
      } else {
        // Handle binary data chunk
        this.receivedChunksCount++;
        console.log(`[Receiver] Got chunk #${this.receivedChunksCount} (${event.data.byteLength} bytes)`);
        this.receiveBuffer.push(event.data);
        this.receivedSize += event.data.byteLength;

        if (this.currentIncomingFile) {
          const progress = this.receivedSize / this.currentIncomingFile.size;

          // Throttle updates but ensure they run in Angular Zone
          const lastProgress = this.transferState$.value?.progress || 0;
          if (progress - lastProgress > 0.01 || progress >= 0.99) {
            this.ngZone.run(() => {
              this.transferState$.next({
                fileName: this.currentIncomingFile!.name,
                progress: progress,
                incoming: true,
                active: true
              });
            });
          }

          // Safety check in case 'file-end' message is lost
          if (this.receivedSize >= this.currentIncomingFile.size) {
            this.saveReceivedFile();
          }
        }
      }
    };
  }

  private saveReceivedFile() {
    if (!this.currentIncomingFile) return;

    const fileName = this.currentIncomingFile.name;

    this.ngZone.run(() => {
      this.transferState$.next({ fileName: fileName, progress: 1, incoming: true, active: true });

      const blob = new Blob(this.receiveBuffer);
      const url = URL.createObjectURL(blob);

      // Reset state IMMEDIATELY after blob creation
      this.currentIncomingFile = null;
      this.receiveBuffer = [];

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Final disappearance after 1 second
      setTimeout(() => {
        this.transferState$.next(null);
      }, 1000);
    });
  }

  private async handleSignal(fromPeerId: string, signalData: any) {
    const pc = this.createPeerConnection(fromPeerId);

    if (signalData.type === 'offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(signalData));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.socket.emit('signal', { to: fromPeerId, signalData: pc.localDescription });
    } else if (signalData.type === 'answer') {
      await pc.setRemoteDescription(new RTCSessionDescription(signalData));
    } else if (signalData.type === 'candidate') {
      await pc.addIceCandidate(new RTCIceCandidate(signalData.candidate));
    }
  }

  private cleanupPeer(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) pc.close();
    this.peerConnections.delete(peerId);
    this.dataChannels.delete(peerId);
  }

  // ----------- File Sending Logic -----------

  public async sendFile(peerId: string, file: File) {
    let pc = this.peerConnections.get(peerId);
    let channel = this.dataChannels.get(peerId);

    // If no channel, we are the initiator, so setup connection
    if (!pc || !channel || channel.readyState !== 'open') {
      pc = this.createPeerConnection(peerId);

      channel = pc.createDataChannel('fileTransfer');
      this.setupDataChannel(channel, peerId);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.socket.emit('signal', { to: peerId, signalData: pc.localDescription });

      // Wait for channel to open before sending (only if not already open)
      if (channel && channel.readyState !== 'open') {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject('Channel open timeout'), 5000);
          channel!.onopen = () => {
            clearTimeout(timeout);
            resolve();
          };
        });
      }
      // Give the channel a tiny bit of time to "settle" (warm-up)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!channel || channel.readyState !== 'open') {
      console.error("Channel not open after initialization");
      return;
    }

    // 1. Send Metadata
    try {
      channel.send(JSON.stringify({ type: 'file-start', name: file.name, size: file.size }));
      this.transferState$.next({ fileName: file.name, progress: 0, incoming: false, active: true });
    } catch (e) {
      console.error("Failed to send metadata:", e);
      return;
    }

    let currentChunkSize = 64 * 1024; // Start in 1st gear (64 KB)
    let chunksSent = 0;
    let offset = 0;

    // Increase the "In-Flight" data buffer to 8MB for God Speed
    channel.bufferedAmountLowThreshold = 8 * 1024 * 1024;

    const sendNextChunk = async () => {
      while (offset < file.size) {
        if (!channel || channel.readyState !== 'open') break;

        if (chunksSent === 10) {
          currentChunkSize = 256 * 1024; // God Speed (Lowered to 256KB for testing)
          console.log("[Sender] Gearing up to God Speed (256KB)");
        }

        // Check backpressure
        if (channel.bufferedAmount > (channel.bufferedAmountLowThreshold || 0)) {
          console.log(`[Sender] Buffer full (${channel.bufferedAmount} bytes), waiting...`);
          await new Promise<void>(resolve => {
            if (!channel) return resolve();
            channel.onbufferedamountlow = () => {
              if (channel) channel.onbufferedamountlow = null;
              resolve();
            };
          });
        }

        if (!channel || channel.readyState !== 'open') break;

        const slice = file.slice(offset, offset + currentChunkSize);
        const buffer = await slice.arrayBuffer();

        try {
          if (channel && channel.readyState === 'open') {
            console.log(`[Sender] Sending chunk #${chunksSent + 1} (${buffer.byteLength} bytes)`);
            channel.send(buffer);
            offset += buffer.byteLength;
            chunksSent++;
          } else {
            break;
          }
        } catch (e) {
          console.error("Failed to send chunk:", e);
          break;
        }

        const progress = offset / file.size;
        const lastProgress = this.transferState$.value?.progress || 0;

        // Throttle sender UI updates to 1% increments
        if (progress - lastProgress > 0.01 || progress >= 0.99) {
          this.ngZone.run(() => {
            this.transferState$.next({
              fileName: file.name,
              progress: progress,
              incoming: false,
              active: true
            });
          });
        }
      }

      // 3. Send End Signal
      try {
        if (channel && channel.readyState === 'open') {
          channel.send(JSON.stringify({ type: 'file-end' }));
        }
      } catch (e) { }

      // Finished
      this.ngZone.run(() => {
        setTimeout(() => {
          this.transferState$.next(null);
        }, 1000);
      });
    };

    sendNextChunk();
  }
}
