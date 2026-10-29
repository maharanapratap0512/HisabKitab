import 'zone.js';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { SutramExcelModule } from '../src/lib/sutram-excel.module';

@Component({
  selector: 'app-root',
  template: `
    <sutram-excel-studio 
      [table]="'item'" 
      [apiBase]="'/_sutram/excel'">
    </sutram-excel-studio>
  `,
  styles: [`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }
  `]
})
export class PlaygroundAppComponent {}

@NgModule({
  declarations: [PlaygroundAppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SutramExcelModule
  ],
  bootstrap: [PlaygroundAppComponent]
})
export class PlaygroundAppModule {}

platformBrowserDynamic().bootstrapModule(PlaygroundAppModule)
  .catch(err => console.error(err));
