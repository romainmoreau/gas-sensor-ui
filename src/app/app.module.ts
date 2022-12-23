import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatToolbarModule } from "@angular/material/toolbar";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HighchartsChartModule } from "highcharts-angular";
import { AppComponent } from "./app.component";
import { GasChartComponent } from "./gas-chart/gas-chart.component";
import { rxStompServiceFactory } from "./rx-stomp-service-factory";
import { RxStompService } from "./rx-stomp.service";
import { ToolbarComponent } from "./toolbar/toolbar.component";

@NgModule({
  declarations: [AppComponent, GasChartComponent, ToolbarComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    HighchartsChartModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonToggleModule,
  ],
  providers: [
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
