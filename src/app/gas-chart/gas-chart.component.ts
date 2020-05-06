import { Component, Input, OnChanges, Output, EventEmitter, SimpleChanges, AfterViewInit, ElementRef } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import theme from 'highcharts/themes/gray';
theme(Highcharts);
import { GasSensingUpdateService } from '../gas-sensing-update.service';
import { Unit, UnitName } from '../unit';
import * as moment from 'moment';
import { Subscription, forkJoin } from 'rxjs';
import { RxStompService } from '@stomp/ng2-stompjs';
import { GasSensingUpdate } from '../gas-sensing-update';
import { GasSensingInterval } from '../gas-sensing-interval';
import { GasChartConfiguration } from '../gas-chart-configuration';

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
  gasChartConfiguration: GasChartConfiguration;

  @Input()
  unitName: UnitName;

  @Input()
  unitValue: number;

  @Input()
  expanded: boolean;

  @Output()
  expandedChange = new EventEmitter<boolean>();

  chart: Highcharts.Chart;

  constructor(
    private elementRef: ElementRef,
    private gasSensingUpdateService: GasSensingUpdateService,
    private rxStompService: RxStompService) {
  }

  updateChartInstance(chart: Highcharts.Chart) {
    this.chart = chart;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.gasChartConfiguration) {
      setTimeout(() => {
        this.updateSeries();
        this.updateIntervals();
        this.updateData();
        this.rxStompService.watch(`/updates/${this.gasChartConfiguration.description}/${this.gasChartConfiguration.unit}`)
          .subscribe(message => {
            const gasSensingUpdate = JSON.parse(message.body) as GasSensingUpdate;
            if (!this.isDataUpdating()) {
              const series = this.chart.series.find(s => s.name === gasSensingUpdate.sensorName);
              if (series) {
                const point = this.gasSensingUpdateService.gasSensingUpdateToData(gasSensingUpdate);
                const data = (series.options as Highcharts.SeriesLineOptions).data as [number, number][];
                this.gasSensingUpdateService.addOrUpdatePoint(point, data, true);
                series.setData(data, false, false, false);
                const othersSeries = this.chart.series.filter(s => s.name !== gasSensingUpdate.sensorName);
                othersSeries.forEach(otherSeries => {
                  const otherData = (otherSeries.options as Highcharts.SeriesLineOptions).data as [number, number][];
                  this.gasSensingUpdateService.addOrUpdatePoint(point, otherData, false);
                  otherSeries.setData(otherData, false, false, false);
                });
                this.chart.redraw();
              }
            }
          });
      });
    } else if (changes.expanded) {
      setTimeout(() => this.chart.reflow());
    } else if (changes.unitValue || changes.unitName) {
      this.updateData();
    }
  }

  private updateSeries(): void {
    while (this.chart.series.length > 0) {
      this.chart.series[0].remove(false);
    }
    this.gasChartConfiguration.sensorNames.forEach(sensorName => {
      this.chart.addSeries({
        type: 'line',
        name: sensorName
      }, false);
    });
  }

  private isIntervalsUpdating(): boolean {
    return this.updateIntervalsSubscription && !this.updateIntervalsSubscription.closed;
  }

  private updateIntervals(): void {
    if (this.isIntervalsUpdating()) {
      this.updateIntervalsSubscription.unsubscribe();
    }
    this.updateIntervalsSubscription = this.gasSensingUpdateService.getIntervals(this.gasChartConfiguration)
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
          value: gasSensingInterval.maxValue !== null ? gasSensingInterval.maxValue : Number.MAX_VALUE
        } as Highcharts.SeriesZonesOptionsObject));
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
    this.updateDataSubscription = forkJoin(this.gasChartConfiguration.sensorNames
      .map(sensorName => this.gasSensingUpdateService.getUpdates(sensorName,
        this.gasChartConfiguration.description, this.gasChartConfiguration.unit, this.unitName, this.unitValue)))
      .subscribe(sensorNamesGasSensingUpdates => {
        const datas = this.gasSensingUpdateService.normalizeDatas(
          this.gasSensingUpdateService.sensorNamesGasSensingUpdatesToDatas(sensorNamesGasSensingUpdates));
        for (let i = 0; i < this.gasChartConfiguration.sensorNames.length; i++) {
          this.chart.series[i].setData(datas[i], false);
        }
        this.chart.redraw();
      });
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
