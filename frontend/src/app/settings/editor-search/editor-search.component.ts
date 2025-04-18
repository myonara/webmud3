import { Component, Input, OnInit } from '@angular/core';

import * as ace from 'ace-builds';
import { WindowConfig } from 'src/app/shared/window-config';

@Component({
    selector: 'app-editor-search',
    templateUrl: './editor-search.component.html',
    styleUrls: ['./editor-search.component.scss'],
    standalone: false
})
export class EditorSearchComponent implements OnInit {
  @Input() set config(cfg: WindowConfig) {
    this._config = cfg;
    this.aceEditor = this.config.data['aceEditor'];
    // console.log('config:', cfg);
  }
  get config(): WindowConfig {
    return this._config;
  }
  private _config: WindowConfig;

  private aceEditor: ace.Ace.Editor;
  seachText = '';
  type = 'text';

  ngOnInit(): void {
    // this.aceEditor = this.config.data['aceEDitor'];
    return;
  }
  onSearch() {
    return;
    //   var range = this.aceEditor.find(this.seachText,{
    //     wrap: true,
    //     caseSensitive: true,
    // })
  }
  onReplace() {
    return;
  }
  doSearch() {
    return;
  }
}
