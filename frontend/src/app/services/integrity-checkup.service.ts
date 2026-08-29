import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IntegrityCheckupService {

  constructor(
    private http: HttpService,
    private api: ApiService
  ) { }

  getTests(): Observable<any> {
    return this.http.get(this.api.getUrl('INTEGRITY') + 'tests');
  }

  scan(testId?: string, selectedColumns?: string[]): Observable<any> {
    return this.http.post(this.api.getUrl('INTEGRITY') + 'scan', { testId, selectedColumns });
  }

  scanStream(testId?: string, selectedColumns?: string[]): Promise<ReadableStream<Uint8Array> | null> {
    const url = this.api.getUrl('INTEGRITY') + 'scan-stream';
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ testId, selectedColumns })
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText || 'Server Error'}`);
      }
      return response.body;
    });
  }

  resolveStream(mismatches: any[], testId?: string): Promise<ReadableStream<Uint8Array> | null> {
    const url = this.api.getUrl('INTEGRITY') + 'resolve';
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mismatches, testId })
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText || 'Server Error'}`);
      }
      return response.body;
    });
  }

  rebuildBachatStream(): Promise<ReadableStream<Uint8Array> | null> {
    const url = this.api.getUrl('INTEGRITY') + 'rebuild-bachat';
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText || 'Server Error'}`);
      }
      return response.body;
    });
  }
}
