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

  normalizeDatas(datas: [number, number][][]): [number, number][][] {
    if (datas.length === 1) {
      return datas;
    }
    const maxLength = Math.max(...datas.map(data => data.length));
    if (maxLength === 0) {
      return datas;
    }
    const normalizedDatas = datas.map(() => []);
    const indexes = datas.map(() => 0);
    while (!indexes.every((index, i) => index === datas[i].length)) {
      const iXMinSorted = indexes.map((index, i) => [index, i]).filter(([index, i]) => index < datas[i].length)
        .map(([index, i]) => [i, datas[i][index][0]]).sort((a, b) => a[1] - b[1]);
      const xMin = iXMinSorted[0][1];
      const iXMin = iXMinSorted.filter(iX => iX[1] === xMin).map(iX => iX[0]);
      normalizedDatas.forEach((normalizedData, i) => {
        if (iXMin.includes(i)) {
          normalizedData.push(datas[i][indexes[i]]);
          indexes[i] = indexes[i] + 1;
        } else if (normalizedData.length !== 0) {
          normalizedData.push([xMin, normalizedData[normalizedData.length - 1][1]]);
        }
      });
    }
    return normalizedDatas;
  }

  sensorNamesGasSensingUpdatesToDatas(sensorNamesGasSensingUpdates: GasSensingUpdate[][]): [number, number][][] {
    return sensorNamesGasSensingUpdates.map(
      gasSensingUpdates => gasSensingUpdates.map(gasSensingUpdate => this.gasSensingUpdateToData(gasSensingUpdate)));
  }

  gasSensingUpdateToData(gasSensingUpdate: GasSensingUpdate): [number, number] {
    return [
      moment(gasSensingUpdate.localDateTime, moment.HTML5_FMT.DATETIME_LOCAL_MS).valueOf(),
      gasSensingUpdate.value
    ];
  }

  getIntervals(parameters: { description: string, unit: string }): Observable<GasSensingInterval[]> {
    return this.httpClient.get<GasSensingInterval[]>(
      `${this.urlPrefix}/intervals/${parameters.description}/`,
      { params: new HttpParams().set('unit', parameters.unit) });
  }
}
