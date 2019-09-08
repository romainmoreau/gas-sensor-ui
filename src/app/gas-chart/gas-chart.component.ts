import { Component, Input, OnChanges, Output, EventEmitter, SimpleChanges, AfterViewInit } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
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
export class GasChartComponent implements OnChanges, AfterViewInit {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    credits: {
      enabled: false
    },
    time: {
      useUTC: false
    },
    series: [{
      type: 'line'
    }],
    plotOptions: {
      series: {
        zones: []
      }
    },
    rangeSelector: {
      enabled: false
    },
    navigator: {
      enabled: false
    },
    scrollbar: {
      enabled: false
    }
  };
  updateChart: boolean;
  updateSubscription: Subscription;

  gasSensingIntervals: GasSensingInterval[];

  @Input()
  gasSensingUpdatesRange: GasSensingUpdatesRange;

  units: Unit[];
  unitName: UnitName = 'm';
  unitValue = 15;

  @Input()
  expanded: boolean;

  @Output()
  expandedChange = new EventEmitter<boolean>();

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.gasSensingUpdatesRange) {
      this.updateName();
      this.updateData();
      this.rxStompService.watch(`/updates/${this.gasSensingUpdatesRange.sensorName}/${this.gasSensingUpdatesRange.description}/${this.gasSensingUpdatesRange.unit}`)
        .subscribe(message => {
          const gasSensingUpdate = JSON.parse(message.body) as GasSensingUpdate;
          if (!this.isUpdating()) {
            this.addGasSensingUpdates([gasSensingUpdate], true);
          }
        });
    } else if (changes.expanded) {
      setTimeout(() => this.chart.reflow());
    }
  }

  isUpdating(): boolean {
    return this.updateSubscription && !this.updateSubscription.closed;
  }

  private updateName(): void {
    this.chartOptions.series[0].name = `${this.gasSensingUpdatesRange.description} (${this.gasSensingUpdatesRange.unit})`;
  }

  private updateData(): void {
    if (this.isUpdating()) {
      this.updateSubscription.unsubscribe();
    }
    this.updateSubscription = forkJoin([
      this.gasSensingUpdateService.getIntervals(this.gasSensingUpdatesRange),
      this.gasSensingUpdateService.getUpdates(this.gasSensingUpdatesRange, this.unitName, this.unitValue)
    ]).subscribe(([gasSensingIntervals, gasSensingUpdates]) => {
      this.gasSensingIntervals = gasSensingIntervals.sort((gasSensingInterval1, gasSensingInterval2) => {
        if (gasSensingInterval1.maxValue === null && gasSensingInterval2.maxValue === null) {
          return 0;
        } else if (gasSensingInterval1.maxValue === null) {
          return 1;
        } else if (gasSensingInterval2.maxValue === null) {
          return -1;
        } else {
          return gasSensingInterval1.maxValue - gasSensingInterval2.maxValue;
        }
      });
      this.addGasSensingUpdates(gasSensingUpdates, false);
    });
  }

  private addGasSensingUpdates(gasSensingUpdates: GasSensingUpdate[], append: boolean): void {
    const data = gasSensingUpdates.map(gasSensingUpdate => [
      moment(gasSensingUpdate.localDateTime, moment.HTML5_FMT.DATETIME_LOCAL_MS).valueOf(),
      gasSensingUpdate.value
    ] as [number, number]);
    this.chartOptions.plotOptions.series.zones = this.gasSensingIntervals.map(gasSensingInterval => ({
      color: this.getColor(gasSensingInterval),
      value: gasSensingInterval.maxValue
    } as Highcharts.PlotSeriesZonesOptions));
    this.addData(data, this.chartOptions.series[0] as Highcharts.SeriesLineOptions, append);
    if (append) {
      this.chart.redraw();
    } else {
      this.updateChart = true;
    }
  }

  private addData(data: [number, number][], seriesOptions: Highcharts.SeriesLineOptions, append: boolean) {
    if (append) {
      data.forEach(d => this.chart.series[0].addPoint(d, false));
    } else {
      seriesOptions.data = data;
    }
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
    this.expandedChange.emit(this.expanded);
  }

  ngAfterViewInit() {
    setTimeout(() => this.chart.reflow());
  }

  private getColor(gasSensingInterval: GasSensingInterval): string {
    switch (gasSensingInterval.category) {
      case 'FINE': return '#2ECC40';
      case 'WARNING': return '#FF851B';
      case 'SEVERE': return '#FF4136';
      default: return;
    }
  }
}
