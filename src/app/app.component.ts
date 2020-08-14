import { Component } from '@angular/core';
import { GasSensingUpdateService } from './gas-sensing-update.service';
import { GasSensingUpdatesRange } from './gas-sensing-updates-range';
import { GasChartConfiguration } from './gas-chart-configuration';
import { UnitValue } from './unit';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  unitValue: UnitValue = { name: 'm', value: 15 };

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
      this.gasChartConfigurations = Object.keys(groupedGasSensingUpdatesRanges).map(id => groupedGasSensingUpdatesRanges[id])
        .map(groupGasSensingUpdatesRanges => ({
          sensorNames: groupGasSensingUpdatesRanges.map(gasSensingUpdatesRange => gasSensingUpdatesRange.sensorName),
          description: groupGasSensingUpdatesRanges[0].description,
          unit: groupGasSensingUpdatesRanges[0].unit
        } as GasChartConfiguration));
    });
  }

  getRowCount(): number {
    return window.matchMedia('(max-height: 899px)').matches ? 1 : 2;
  }

  getMdFlex(): string {
    const rowCount = this.getRowCount();
    if (this.expanded || this.gasChartConfigurations.length <= rowCount) {
      return '100%';
    } else {
      return '50%';
    }
  }

  getLgFlex(): string {
    const rowCount = this.getRowCount();
    if (this.expanded || this.gasChartConfigurations.length <= rowCount) {
      return '100%';
    } else if (this.gasChartConfigurations.length <= rowCount * 2) {
      return '50%';
    } else {
      return 'calc(100% / 3)';
    }
  }

  getGtLgFlex(): string {
    const rowCount = this.getRowCount();
    if (this.expanded || this.gasChartConfigurations.length <= rowCount) {
      return '100%';
    } else if (this.gasChartConfigurations.length <= rowCount * 2) {
      return '50%';
    } else if (this.gasChartConfigurations.length <= rowCount * 3) {
      return 'calc(100% / 3)';
    } else {
      return '25%';
    }
  }
}
