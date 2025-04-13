import { Component, OnInit } from '@angular/core';
import { WebmudConfig } from '../../mud/webmud-config';
import { ServerConfigService } from '../../shared/server-config.service';

@Component({
    selector: 'app-unitopia',
    templateUrl: './unitopia.component.html',
    styleUrls: ['./unitopia.component.scss'],
    standalone: false
})
export class UnitopiaComponent {
  public mudcfg: WebmudConfig = {
    mudname: this.srvcfg.getUNItopiaName(),
    autoConnect: true,
    autoLogin: false,
    autoUser: '',
    autoToken: '',
    localEcho: true,
  };

  constructor(public srvcfg: ServerConfigService) {}
}
