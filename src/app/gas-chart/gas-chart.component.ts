import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { GasSensingUpdatesRange } from '../gas-sensing-updates-range';
import { GasSensingUpdateService } from '../gas-sensing-update.service';
import { Unit, UnitName } from '../unit';
import * as moment from 'moment';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-gas-chart',
  templateUrl: './gas-chart.component.html',
  styleUrls: ['./gas-chart.component.scss']
})
export class GasChartComponent implements OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    credits: {
      enabled: false
    },
    title: {
      text: undefined
    },
    xAxis: {
      type: 'datetime'
    },
    time: {
      useUTC: false
    },
    series: [
      this.createSeries('GENERIC', '#0074D9'),
      this.createSeries('FINE', '#2ECC40'),
      this.createSeries('WARNING', '#FF851B'),
      this.createSeries('SEVERE', '#FF4136')
    ]
  };
  updateChart: boolean;

  @Input()
  gasSensingUpdatesRange: GasSensingUpdatesRange;

  units: Unit[];
  unitName: UnitName = 'm';
  unitValue = 15;

  constructor(private gasSensingUpdateService: GasSensingUpdateService) {
    this.units = [
      { name: 'm', values: [1, 5, 15, 30] },
      { name: 'h', values: [1, 2, 3, 6, 12] },
      { name: 'd', values: [1, 2, 3, 7, 14] }
    ];
  }

  changeUnit(unitName: UnitName, unitValue: number): void {
    this.unitName = unitName;
    this.unitValue = unitValue;
    this.updateData();
  }

  ngOnChanges(): void {
    this.updateData();
  }

  private updateData(): void {
    forkJoin(this.gasSensingUpdateService.getIntervals(this.gasSensingUpdatesRange),
      this.gasSensingUpdateService.getUpdates(this.gasSensingUpdatesRange, this.unitName, this.unitValue))
      .subscribe(([gasSensingIntervals, gasSensingUpdates]) => {
        const data = gasSensingUpdates.map(gasSensingUpdate => [
          moment(gasSensingUpdate.localDateTime, moment.HTML5_FMT.DATETIME_LOCAL_MS).valueOf(),
          gasSensingUpdate.value
        ] as [number, number]);
        if (gasSensingIntervals.length === 0) {
          (this.chartOptions.series[0] as Highcharts.SeriesScatterOptions).data = data;
        } else {
          gasSensingIntervals.forEach(gasSensingInterval => {
            const filteredData = data.filter(d => (gasSensingInterval.minValue === null || gasSensingInterval.minValue >= d[1])
              && (gasSensingInterval.maxValue === null || gasSensingInterval.maxValue < d[1]));
            if (gasSensingInterval.category === 'FINE') {
              (this.chartOptions.series[1] as Highcharts.SeriesScatterOptions).data = filteredData;
            } else if (gasSensingInterval.category === 'WARNING') {
              (this.chartOptions.series[2] as Highcharts.SeriesScatterOptions).data = filteredData;
            } else if (gasSensingInterval.category === 'SEVERE') {
              (this.chartOptions.series[3] as Highcharts.SeriesScatterOptions).data = filteredData;
            }
          });
        }
        this.updateChart = true;
      });
  }

  private createSeries(name: string, color: string): Highcharts.SeriesScatterOptions {
    return {
      name,
      color,
      type: 'scatter',
      tooltip: {
        pointFormatter() {
          return `${moment(this.x).format()}<br/>Value: ${this.y}`;
        }
      },
      marker: {
        radius: 1
      }
    };
  }
}
