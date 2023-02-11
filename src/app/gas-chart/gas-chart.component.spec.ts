import { HttpRequest } from "@angular/common/http";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { Component, Injectable, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { IMessage } from "@stomp/stompjs";
import { HighchartsChartModule } from "highcharts-angular";
import { EMPTY, Observable } from "rxjs";
import { GasChartConfiguration } from "../gas-chart-configuration";
import { RxStompService } from "../rx-stomp.service";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { UnitValue } from "../unit";
import { GasChartComponent } from "./gas-chart.component";

@Component({
  template: `<app-gas-chart
    [gasChartConfiguration]="gasChartConfiguration"
    [globalUnitValue]="unitValue"
  ></app-gas-chart>`,
})
class GasChartHostComponent {
  @ViewChild(GasChartComponent)
  gasChartComponent!: GasChartComponent;

  gasChartConfiguration!: GasChartConfiguration;

  unitValue!: UnitValue;
}

@Injectable()
export class TestRxStompService {
  watch(): Observable<IMessage> {
    return EMPTY;
  }
}

describe("GasChartComponent", () => {
  let httpTestingController: HttpTestingController;
  let fixture: ComponentFixture<GasChartHostComponent>;
  let component: GasChartHostComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ToolbarComponent,
        GasChartComponent,
        GasChartHostComponent,
      ],
      imports: [
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatCardModule,
        HighchartsChartModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatButtonToggleModule,
      ],
      providers: [
        {
          provide: RxStompService,
          useClass: TestRxStompService,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(GasChartHostComponent);
    component = fixture.componentInstance;
  });

  it("should create", waitForAsync(() => {
    expect(component).toBeTruthy();
    component.gasChartConfiguration = {
      sensorNames: ["SDS018"],
      description: "PM2.5",
      unit: "ug/m3",
    };
    component.unitValue = { name: "m", value: 15 };
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.gasChartComponent).toBeTruthy();
      expect(component.gasChartComponent.isDataUpdating()).toBeTruthy();
      const updatesTestRequests = httpTestingController.match(
        (httpRequest: HttpRequest<unknown>) =>
          httpRequest.url.includes("/updates/")
      );
      expect(updatesTestRequests).toBeTruthy();
      expect(updatesTestRequests.length).toBe(1);
      const updatesTestRequest = updatesTestRequests[0];
      updatesTestRequest.flush({
        periodUpdates: [
          {
            id: 0,
            sensorName: "SDS018",
            localDateTime: "2019-08-31T21:34:31.847774",
            description: "PM2.5",
            readValue: 4.2,
            unit: "ug/m3",
          },
          {
            id: 1,
            sensorName: "SDS018",
            localDateTime: "2019-08-31T21:34:32.843854",
            description: "PM2.5",
            readValue: 4.5,
            unit: "ug/m3",
          },
        ],
      });
      const intervalsTestRequests = httpTestingController.match(
        (httpRequest: HttpRequest<unknown>) =>
          httpRequest.url.includes("/intervals/")
      );
      expect(intervalsTestRequests).toBeTruthy();
      expect(intervalsTestRequests.length).toBe(1);
      const intervalsTestRequest = intervalsTestRequests[0];
      intervalsTestRequest.flush([
        {
          id: 0,
          description: "PM2.5",
          unit: "ug/m3",
          category: "FINE",
          minValue: 15.0,
          maxValue: null,
        },
        {
          id: 1,
          description: "PM2.5",
          unit: "ug/m3",
          category: "WARNING",
          minValue: 45.0,
          maxValue: 15.0,
        },
        {
          id: 2,
          description: "PM2.5",
          unit: "ug/m3",
          category: "SEVERE",
          minValue: null,
          maxValue: 45.0,
        },
      ]);
      const alertsTestRequests = httpTestingController.match(
        (httpRequest: HttpRequest<unknown>) =>
          httpRequest.url.includes("/alert/")
      );
      expect(alertsTestRequests).toBeTruthy();
      expect(alertsTestRequests.length).toBe(1);
      const alertsTestRequest = alertsTestRequests[0];
      alertsTestRequest.flush({
        id: 0,
        sensorName: "SDS018",
        description: "PM2.5",
        unit: "ug/m3",
        thresholdCategory: "WARNING",
      });
      fixture.detectChanges();
      expect(component.gasChartComponent.isDataUpdating()).toBeFalsy();
    });
  }));

  afterEach(() => {
    httpTestingController.verify();
  });
});
