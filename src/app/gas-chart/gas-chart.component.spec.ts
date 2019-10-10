import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GasChartComponent } from './gas-chart.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpRequest } from '@angular/common/http';
import { Component, ViewChild, Injectable } from '@angular/core';
import { RxStompService } from '@stomp/ng2-stompjs';
import { Observable, EMPTY } from 'rxjs';
import { IMessage } from '@stomp/stompjs';
import { MatIconModule } from '@angular/material/icon';
import { GasChartConfiguration } from '../gas-chart-configuration';

@Component({
  template: `<app-gas-chart [gasChartConfiguration]="gasChartConfiguration"></app-gas-chart>`
})
class GasChartHostComponent {
  @ViewChild(GasChartComponent, { static: false })
  gasChartComponent: GasChartComponent;

  gasChartConfiguration: GasChartConfiguration;
}

@Injectable()
export class TestRxStompService {
  watch(): Observable<IMessage> {
    return EMPTY;
  }
}

describe('GasChartComponent', () => {
  let httpTestingController: HttpTestingController;
  let fixture: ComponentFixture<GasChartHostComponent>;
  let component: GasChartHostComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GasChartComponent,
        GasChartHostComponent
      ],
      imports: [
        HttpClientTestingModule,
        FlexLayoutModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatCardModule,
        HighchartsChartModule,
        MatProgressSpinnerModule,
        MatIconModule
      ],
      providers: [
        {
          provide: RxStompService,
          useClass: TestRxStompService
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    httpTestingController = TestBed.get(HttpTestingController);
    fixture = TestBed.createComponent(GasChartHostComponent);
    component = fixture.componentInstance;
  });

  it('should create', async(() => {
    expect(component).toBeTruthy();
    component.gasChartConfiguration = {
      sensorNames: ['SDS018'],
      description: 'PM2.5',
      unit: 'ug/m3'
    };
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.gasChartComponent).toBeTruthy();
      expect(component.gasChartComponent.isDataUpdating()).toBeTruthy();
      const updatesTestRequests = httpTestingController.match((httpRequest: HttpRequest<any>) => httpRequest.url.includes('/updates/'));
      expect(updatesTestRequests).toBeTruthy();
      expect(updatesTestRequests.length).toBe(1);
      const updatesTestRequest = updatesTestRequests[0];
      updatesTestRequest.flush([{
        id: 0,
        sensorName: 'SDS018',
        localDateTime: '2019-08-31T21:34:31.847774',
        description: 'PM2.5',
        value: 4.20000,
        unit: 'ug/m3'
      }, {
        id: 1,
        sensorName: 'SDS018',
        localDateTime: '2019-08-31T21:34:32.843854',
        description: 'PM2.5',
        value: 4.50000,
        unit: 'ug/m3'
      }]);
      const intervalsTestRequests = httpTestingController.match((httpRequest: HttpRequest<any>) => httpRequest.url.includes('/intervals/'));
      expect(intervalsTestRequests).toBeTruthy();
      expect(intervalsTestRequests.length).toBe(1);
      const intervalsTestRequest = intervalsTestRequests[0];
      intervalsTestRequest.flush([{
        id: 0,
        description: 'PM2.5',
        unit: 'ug/m3',
        category: 'FINE',
        minValue: 15.00000,
        maxValue: null
      }, {
        id: 1,
        description: 'PM2.5',
        unit: 'ug/m3',
        category: 'WARNING',
        minValue: 45.00000,
        maxValue: 15.00000
      }, {
        id: 2,
        description: 'PM2.5',
        unit: 'ug/m3',
        category: 'SEVERE',
        minValue: null,
        maxValue: 45.00000
      }]);
      fixture.detectChanges();
      expect(component.gasChartComponent.isDataUpdating()).toBeFalsy();
    });
  }));

  afterEach(() => {
    httpTestingController.verify();
  });
});
