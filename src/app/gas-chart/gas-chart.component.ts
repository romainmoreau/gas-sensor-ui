import { Component, Input, OnChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
import { GasSensingUpdatesRange } from '../gas-sensing-updates-range';
import { GasSensingUpdateService } from '../gas-sensing-update.service';
import { Unit, UnitName } from '../unit';
import * as moment from 'moment';
import { forkJoin, Subscription } from 'rxjs';
import { RxStompService } from '@stomp/ng2-stompjs';
import { GasSensingUpdate } from '../gas-sensing-update';
import { GasSensingInterval } from '../gas-sensing-interval';

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
      this.createSeriesOptions('GENERIC', '#0074D9'),
      this.createSeriesOptions('FINE', '#2ECC40'),
      this.createSeriesOptions('WARNING', '#FF851B'),
      this.createSeriesOptions('SEVERE', '#FF4136')
    ]
  };
  updateChart: boolean;
  updateSubscription: Subscription;

  gasSensingIntervals: GasSensingInterval[];

  @Input()
  gasSensingUpdatesRange: GasSensingUpdatesRange;

  units: Unit[];
  unitName: UnitName = 'm';
  unitValue = 15;

  expanded: boolean;

  chart: Highcharts.Chart;
  chartCallback: Highcharts.ChartCallbackFunction = (chart: Highcharts.Chart) => this.chart = chart;

  constructor(private gasSensingUpdateService: GasSensingUpdateService, private rxStompService: RxStompService) {
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
    this.rxStompService.watch(`/updates/${this.gasSensingUpdatesRange.sensorName}/${this.gasSensingUpdatesRange.description}/${this.gasSensingUpdatesRange.unit}`)
      .subscribe(message => {
        const gasSensingUpdate = JSON.parse(message.body) as GasSensingUpdate;
        if (!this.isUpdating()) {
          this.addGasSensingUpdates([gasSensingUpdate], true);
        }
      });
  }

  isUpdating(): boolean {
    return this.updateSubscription && !this.updateSubscription.closed;
  }

  private updateData(): void {
    if (this.isUpdating()) {
      this.updateSubscription.unsubscribe();
    }
    this.updateSubscription = forkJoin([
      this.gasSensingUpdateService.getIntervals(this.gasSensingUpdatesRange),
      this.gasSensingUpdateService.getUpdates(this.gasSensingUpdatesRange, this.unitName, this.unitValue)
    ]).subscribe(([gasSensingIntervals, gasSensingUpdates]) => {
      this.gasSensingIntervals = gasSensingIntervals;
      this.addGasSensingUpdates(gasSensingUpdates, false);
    });
  }

  private addGasSensingUpdates(gasSensingUpdates: GasSensingUpdate[], append: boolean): void {
    const data = gasSensingUpdates.map(gasSensingUpdate => [
      moment(gasSensingUpdate.localDateTime, moment.HTML5_FMT.DATETIME_LOCAL_MS).valueOf(),
      gasSensingUpdate.value
    ] as [number, number]);
    if (this.gasSensingIntervals.length === 0) {
      this.addData(data, this.chartOptions.series[0] as Highcharts.SeriesScatterOptions, append);
    } else {
      this.gasSensingIntervals.forEach(gasSensingInterval => {
        const filteredData = data.filter(d => (gasSensingInterval.minValue === null || gasSensingInterval.minValue >= d[1])
          && (gasSensingInterval.maxValue === null || gasSensingInterval.maxValue < d[1]));
        if (gasSensingInterval.category === 'FINE') {
          this.addData(filteredData, this.chartOptions.series[1] as Highcharts.SeriesScatterOptions, append);
        } else if (gasSensingInterval.category === 'WARNING') {
          this.addData(filteredData, this.chartOptions.series[2] as Highcharts.SeriesScatterOptions, append);
        } else if (gasSensingInterval.category === 'SEVERE') {
          this.addData(filteredData, this.chartOptions.series[3] as Highcharts.SeriesScatterOptions, append);
        }
      });
    }
    if (append) {
      this.chart.redraw();
    } else {
      this.updateChart = true;
    }
  }

  private addData(data: [number, number][], seriesOptions: Highcharts.SeriesScatterOptions, append: boolean) {
    if (append) {
      const series = this.chart.get(seriesOptions.id) as Highcharts.Series;
      data.forEach(d => series.addPoint(d, false));
    } else {
      seriesOptions.data = data;
    }
  }

  private createSeriesOptions(name: string, color: string): Highcharts.SeriesScatterOptions {
    return {
      id: name,
      name,
      color,
      type: 'scatter',
      tooltip: {
        pointFormatter() {
          return `${moment(this.x).format()}<br/>Value: ${this.y}`;
        }
      }
    };
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
    setTimeout(() => this.chart.reflow());
  }
}
