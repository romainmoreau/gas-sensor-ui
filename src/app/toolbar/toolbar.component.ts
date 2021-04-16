import { Component, Output, EventEmitter, Input } from '@angular/core';
import { UnitValue, Unit } from '../unit';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Input()
  unitValue: UnitValue;

  @Input()
  addEmptyUnitValue: boolean;

  @Output()
  unitValueChange = new EventEmitter<UnitValue>();

  units: Unit[];

  toolbarVisible: boolean;

  constructor() {
    this.units = [
      { name: 'm', values: [1, 5, 15, 30] },
      { name: 'h', values: [1, 2, 3, 6, 12] },
      { name: 'd', values: [1, 2, 3, 7, 14] }
    ];
  }

  changeUnitValue(unitValue?: UnitValue): void {
    this.unitValue = unitValue;
    this.unitValueChange.emit(unitValue);
  }
}
