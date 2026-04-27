import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetdropUiComponent } from './components/netdrop-ui/netdrop-ui.component';
import { NetdropService } from './services/netdrop.service';

export interface NetDropConfig {
  serverUrl: string;
}

@NgModule({
  declarations: [
    NetdropUiComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    NetdropUiComponent
  ]
})
export class NetdropModule { 
  static forRoot(config: NetDropConfig): ModuleWithProviders<NetdropModule> {
    return {
      ngModule: NetdropModule,
      providers: [
        NetdropService,
        { provide: 'NETDROP_CONFIG', useValue: config }
      ]
    };
  }
}
