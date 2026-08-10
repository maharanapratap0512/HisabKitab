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

  scan(testId?: string): Observable<any> {
    return this.http.post(this.api.getUrl('INTEGRITY') + 'scan', { testId });
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
        throw new Error('Network response was not ok');
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
        throw new Error('Network response was not ok');
      }
      return response.body;
    });
  }
}
