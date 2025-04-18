import { Component, Input } from '@angular/core';
import { InventoryList } from 'src/app/mud/mud-signals';

@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.scss'],
    standalone: false
})
export class InventoryComponent {
  @Input() inv: InventoryList;
  @Input() vheight: number;

  public mystyle(): string {
    if (this.vheight == 0) {
      this.vheight = 300;
    }
    return "{width: '100%', height: '" + this.vheight + "px'}";
  }
}
