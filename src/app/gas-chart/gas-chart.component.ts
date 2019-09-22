import { Component, Input, OnChanges, Output, EventEmitter, SimpleChanges, AfterViewInit, ElementRef } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import theme from 'highcharts/themes/gray';
theme(Highcharts);
import { GasSensingUpdatesRange } from '../gas-sensing-updates-range';
import { GasSensingUpdateService } from '../gas-sensing-update.service';
import { Unit, UnitName } from '../unit';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
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
  updateIntervalsSubscription: Subscription;
  updateDataSubscription: Subscription;

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

  constructor(
    private elementRef: ElementRef,
    private gasSensingUpdateService: GasSensingUpdateService,
    private rxStompService: RxStompService) {
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
      this.updateIntervals();
      this.updateData();
      this.rxStompService.watch(`/updates/${this.gasSensingUpdatesRange.sensorName}/${this.gasSensingUpdatesRange.description}/${this.gasSensingUpdatesRange.unit}`)
        .subscribe(message => {
          const gasSensingUpdate = JSON.parse(message.body) as GasSensingUpdate;
          if (!this.isDataUpdating()) {
            this.chart.series[0].addPoint(this.gasSensingUpdateToData(gasSensingUpdate));
          }
        });
    } else if (changes.expanded) {
      setTimeout(() => this.chart.reflow());
    }
  }

  private updateName(): void {
    this.chartOptions.series[0].name = `${this.gasSensingUpdatesRange.description} (${this.gasSensingUpdatesRange.unit})`;
  }

  private isIntervalsUpdating(): boolean {
    return this.updateIntervalsSubscription && !this.updateIntervalsSubscription.closed;
  }

  private updateIntervals(): void {
    if (this.isIntervalsUpdating()) {
      this.updateIntervalsSubscription.unsubscribe();
    }
    this.updateIntervalsSubscription = this.gasSensingUpdateService.getIntervals(this.gasSensingUpdatesRange)
      .subscribe(gasSensingIntervals => {
        this.chartOptions.plotOptions.series.zones = gasSensingIntervals.sort((gasSensingInterval1, gasSensingInterval2) => {
          if (gasSensingInterval1.maxValue === null && gasSensingInterval2.maxValue === null) {
            return 0;
          } else if (gasSensingInterval1.maxValue === null) {
            return 1;
          } else if (gasSensingInterval2.maxValue === null) {
            return -1;
          } else {
            return gasSensingInterval1.maxValue - gasSensingInterval2.maxValue;
          }
        }).map(gasSensingInterval => ({
          color: this.getColor(gasSensingInterval),
          value: gasSensingInterval.maxValue
        } as Highcharts.PlotSeriesZonesOptions));
        this.updateChart = true;
      });
  }

  isDataUpdating(): boolean {
    return this.updateDataSubscription && !this.updateDataSubscription.closed;
  }

  private updateData(): void {
    if (this.isDataUpdating()) {
      this.updateDataSubscription.unsubscribe();
    }
    this.updateDataSubscription = this.gasSensingUpdateService.getUpdates(this.gasSensingUpdatesRange, this.unitName, this.unitValue)
      .subscribe(gasSensingUpdates => {
        const data = gasSensingUpdates.map(gasSensingUpdate => this.gasSensingUpdateToData(gasSensingUpdate));
        this.chart.series[0].setData(data);
      });
  }

  private gasSensingUpdateToData(gasSensingUpdate: GasSensingUpdate): [number, number] {
    return [
      moment(gasSensingUpdate.localDateTime, moment.HTML5_FMT.DATETIME_LOCAL_MS).valueOf(),
      gasSensingUpdate.value
    ];
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
    setTimeout(() => this.elementRef.nativeElement.scrollIntoView());
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
