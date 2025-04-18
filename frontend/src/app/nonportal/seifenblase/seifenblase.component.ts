import { Component, OnInit } from '@angular/core';
import { WebmudConfig } from '../../mud/webmud-config';
import { ServerConfigService } from '../../shared/server-config.service';

@Component({
    selector: 'app-seifenblase',
    templateUrl: './seifenblase.component.html',
    styleUrls: ['./seifenblase.component.scss'],
    standalone: false
})
export class SeifenblaseComponent {
  public mudcfg: WebmudConfig = {
    mudname: this.srvcfg.getSeifenblase(),
    autoConnect: true,
    autoLogin: false,
    autoUser: '',
    autoToken: '',
    localEcho: true,
  };

  constructor(public srvcfg: ServerConfigService) {}
}
