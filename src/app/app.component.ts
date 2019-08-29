import { Component } from '@angular/core';
import { GasSensingUpdateService } from './gas-sensing-update.service';
import { GasSensingUpdatesRange } from './gas-sensing-updates-range';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  gasSensingUpdatesRanges: GasSensingUpdatesRange[];

  constructor(gasSensingUpdateService: GasSensingUpdateService) {
    gasSensingUpdateService.getRanges().subscribe(gasSensingUpdatesRanges => {
      this.gasSensingUpdatesRanges = gasSensingUpdatesRanges;
    });
  }
}
