import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-sutram-studio',
  templateUrl: './sutram-studio.component.html',
  styleUrls: ['./sutram-studio.component.scss']
})
export class SutramStudioComponent implements OnInit {
  rawStudioUrl: string = '';
  safeStudioUrl: SafeResourceUrl | null = null;
  isLoading: boolean = true;
  backendPort: number = 3200;

  constructor(
    private sanitizer: DomSanitizer,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    const baseUrl = this.api.getUrl('BASE');
    if (baseUrl) {
      this.rawStudioUrl = baseUrl.replace(/\/api\/?$/, '') + '/_sutram/excel/studio/';
      const match = this.rawStudioUrl.match(/:(\d+)/);
      if (match) {
        this.backendPort = +match[1];
      }
    } else {
      const currentHost = window.location.hostname || 'localhost';
      const host = window.location.host;
      const portMatch = host.match(/:(\d+)/);
      const fPort = portMatch ? +portMatch[1] : 4200;
      const bPort = fPort - 1000;
      this.backendPort = bPort;
      const protocol = window.location.protocol || 'http:';
      this.rawStudioUrl = `${protocol}//${currentHost}:${bPort}/_sutram/excel/studio/`;
    }

    this.safeStudioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawStudioUrl);
  }

  onIframeLoad(): void {
    this.isLoading = false;
  }

  openSeparateTab(): void {
    if (this.rawStudioUrl) {
      window.open(this.rawStudioUrl, '_blank');
    }
  }

  reloadStudio(): void {
    this.isLoading = true;
    const current = this.rawStudioUrl.split('?')[0];
    this.rawStudioUrl = `${current}?t=${Date.now()}`;
    this.safeStudioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawStudioUrl);
  }
}
