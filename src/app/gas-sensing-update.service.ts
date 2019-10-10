import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GasSensingUpdatesRange } from './gas-sensing-updates-range';
import * as moment from 'moment';
import { GasSensingUpdate } from './gas-sensing-update';
import { GasSensingInterval } from './gas-sensing-interval';
import { UnitName } from './unit';

@Injectable({
  providedIn: 'root'
})
export class GasSensingUpdateService {
  private urlPrefix = '/api';

  constructor(private httpClient: HttpClient) { }

  getRanges(): Observable<GasSensingUpdatesRange[]> {
    return this.httpClient.get<GasSensingUpdatesRange[]>(`${this.urlPrefix}/ranges`);
  }

  getUpdates(
    sensorName: string,
    description: string,
    unit: string,
    unitName: UnitName,
    unitValue: number): Observable<GasSensingUpdate[]> {
    const beginning: string = moment().subtract(unitValue, unitName).format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
    const end: string = moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
    return this.httpClient.get<GasSensingUpdate[]>(
      `${this.urlPrefix}/updates/${sensorName}/${description}/${beginning}/${end}`,
      { params: new HttpParams().set('unit', unit) });
  }

  getIntervals(parameters: { description: string, unit: string }): Observable<GasSensingInterval[]> {
    return this.httpClient.get<GasSensingInterval[]>(
      `${this.urlPrefix}/intervals/${parameters.description}/`,
      { params: new HttpParams().set('unit', parameters.unit) });
  }
}
