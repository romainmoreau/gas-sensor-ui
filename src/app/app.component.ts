import { Component } from '@angular/core';
import { GasSensingUpdateService } from './gas-sensing-update.service';
import { GasSensingUpdatesRange } from './gas-sensing-updates-range';
import { GasChartConfiguration } from './gas-chart-configuration';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  gasChartConfigurations: GasChartConfiguration[];

  expanded: boolean;

  constructor(gasSensingUpdateService: GasSensingUpdateService) {
    gasSensingUpdateService.getRanges().subscribe(gasSensingUpdatesRanges => {
      const groupedGasSensingUpdatesRanges: { [id: string]: GasSensingUpdatesRange[] } = {};
      gasSensingUpdatesRanges.forEach(gasSensingUpdatesRange => {
        const id = `${gasSensingUpdatesRange.description}/${gasSensingUpdatesRange.unit}`;
        const groupGasSensingUpdatesRanges = groupedGasSensingUpdatesRanges[id];
        if (groupGasSensingUpdatesRanges) {
          groupGasSensingUpdatesRanges.push(gasSensingUpdatesRange);
        } else {
          groupedGasSensingUpdatesRanges[id] = [gasSensingUpdatesRange];
        }
      });
      this.gasChartConfigurations = Object.values(groupedGasSensingUpdatesRanges)
        .map(groupGasSensingUpdatesRanges => ({
          sensorNames: groupGasSensingUpdatesRanges.map(gasSensingUpdatesRange => gasSensingUpdatesRange.sensorName),
          description: groupGasSensingUpdatesRanges[0].description,
          unit: groupGasSensingUpdatesRanges[0].unit
        } as GasChartConfiguration));
    });
  }
}
