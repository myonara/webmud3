import { Component, OnInit } from '@angular/core';
import { WebmudConfig } from '../../mud/webmud-config';
import { ServerConfigService } from '../../shared/server-config.service';

@Component({
  selector: 'app-orbit',
  templateUrl: './orbit.component.html',
  styleUrls: ['./orbit.component.css']
})
export class OrbitComponent implements OnInit {

  public mudcfg : WebmudConfig = {
    mudname : this.srvcfg.getOrbitName(),
    autoConnect : true,
    autoLogin : false,
    autoUser : '',
    autoToken:'',
    localEcho : true
  }

  constructor(public srvcfg:ServerConfigService) { }

  ngOnInit() {
  }

}
