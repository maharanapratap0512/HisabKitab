import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-sutram-studio',
  templateUrl: './sutram-studio.component.html',
  styleUrls: ['./sutram-studio.component.scss']
})
export class SutramStudioComponent implements OnInit {
  rawStudioUrl: string = 'http://localhost:3200/_sutram/excel/studio/';
  safeStudioUrl: SafeResourceUrl | null = null;
  isLoading: boolean = true;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.safeStudioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawStudioUrl);
  }

  onIframeLoad(): void {
    this.isLoading = false;
  }

  openSeparateTab(): void {
    window.open(this.rawStudioUrl, '_blank');
  }

  reloadStudio(): void {
    this.isLoading = true;
    const current = this.rawStudioUrl.split('?')[0];
    this.rawStudioUrl = `${current}?t=${Date.now()}`;
    this.safeStudioUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawStudioUrl);
  }
}
