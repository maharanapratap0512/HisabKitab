import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { NetdropService, Peer, FileTransferState } from '../../services/netdrop.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-netdrop-ui',
  templateUrl: './netdrop-ui.component.html',
  styleUrls: ['./netdrop-ui.component.css']
})
export class NetdropUiComponent implements OnInit, OnDestroy {
  peers: Peer[] = [];
  transferState: FileTransferState | null = null;
  myName: string = '';
  isMobile: boolean = false;
  displayUrl: string = '';
  showHelp: boolean = false;
  isOnline: boolean = navigator.onLine;

  private subs = new Subscription();
  private selectedPeerId: string | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private netdropService: NetdropService) { }

  ngOnInit(): void {
    this.myName = this.netdropService.getMyName();
    this.netdropService.connect();

    this.subs.add(
      this.netdropService.peers$.subscribe(p => {
        this.peers = p;
      })
    );

    this.subs.add(
      this.netdropService.transferState$.subscribe(state => {
        this.transferState = state;
      })
    );

    this.subs.add(
      this.netdropService.serverIp$.subscribe(ip => {
        if (ip) {
          const port = window.location.port;
          this.displayUrl = `http://${ip}${port ? ':' + port : ''}/netdrop`;
        }
      })
    );

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.netdropService.rejoin(); // Re-broadcast presence immediately
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.peers = []; // Clear list immediately when offline
    });

    this.checkDeviceType();
  }

  getPeerStyle(index: number, total: number) {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 90; // Balanced radius for better visibility
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return {
      'transform': `translate(${x}px, ${y}px)`
    };
  }

  getPeerColor(name: string) {
    const colors = [
      'linear-gradient(135deg, #f38ba8, #fab387)',
      'linear-gradient(135deg, #a6e3a1, #94e2d5)',
      'linear-gradient(135deg, #89b4fa, #b4befe)',
      'linear-gradient(135deg, #f9e2af, #fab387)',
      'linear-gradient(135deg, #cba6f7, #f5c2e7)'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }

  private checkDeviceType() {
    const userAgent = navigator.userAgent || navigator.vendor;
    this.isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      || window.innerWidth <= 768;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.netdropService.disconnect();
  }

  openFilePicker(peerId: string) {
    this.selectedPeerId = peerId;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file && this.selectedPeerId) {
      this.netdropService.sendFile(this.selectedPeerId, file);
    }
    // Reset input
    event.target.value = '';
    this.selectedPeerId = null;
  }
}
