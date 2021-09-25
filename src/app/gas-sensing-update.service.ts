import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GasSensingUpdatesRange } from './gas-sensing-updates-range';
import * as moment from 'moment';
import { GasSensingUpdate } from './gas-sensing-update';
import { GasSensingInterval } from './gas-sensing-interval';
import { GasSensingUpdates } from './gas-sensing-updates';

@Injectable({
  providedIn: 'root'
})
export class GasSensingUpdateService {
  private readonly momentFormat = moment.HTML5_FMT.DATETIME_LOCAL_MS;

  private readonly urlPrefix = '/api';

  constructor(private httpClient: HttpClient) { }

  getRanges(): Observable<GasSensingUpdatesRange[]> {
    return this.httpClient.get<GasSensingUpdatesRange[]>(`${this.urlPrefix}/ranges`);
  }

  getUpdates(
    sensorName: string,
    description: string,
    unit: string,
    beginning: moment.Moment,
    end: moment.Moment): Observable<GasSensingUpdates> {
    return this.httpClient.get<GasSensingUpdates>(
      `${this.urlPrefix}/updates/${sensorName}/${description}/${this.formatMoment(beginning)}/${this.formatMoment(end)}`,
      { params: new HttpParams().set('unit', unit) });
  }

  addOrUpdatePoint(point: [number, number], data: [number, number][], realPoint: boolean): void {
    let iExisting: number;
    let iBefore: number;
    for (let i = 0; i < data.length; i++) {
      const pointAtI = data[data.length - i - 1];
      const dx = pointAtI[0] - point[0];
      if (dx === 0) {
        iExisting = i;
        break;
      } else if (dx < 0) {
        iBefore = i;
        break;
      }
    }
    if (iExisting !== undefined) {
      if (realPoint) {
        data[data.length - iExisting - 1] = point;
      }
    } else {
      if (realPoint && iBefore === undefined) {
        iBefore = data.length;
      }
      if (!realPoint) {
        if (iBefore === undefined) {
          return;
        }
        point = [point[0], data[data.length - iBefore - 1][1]];
      }
      data.splice(data.length - iBefore, 0, point);
    }
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

  sensorNamesGasSensingUpdatesToDatas(sensorNamesGasSensingUpdates: GasSensingUpdates[], beginning: moment.Moment): [number, number][][] {
    return sensorNamesGasSensingUpdates.map(gasSensingUpdates => {
      if (gasSensingUpdates.periodUpdates.length === 0) {
        if (gasSensingUpdates.firstOutOfPeriodUpdate) {
          return [this.gasSensingUpdateToData(gasSensingUpdates.firstOutOfPeriodUpdate, beginning)];
        } else {
          return [];
        }
      } else {
        const firstPeriodUpdate = gasSensingUpdates.periodUpdates[0];
        const firstPeriodMoment = this.parseMoment(firstPeriodUpdate.localDateTime);
        const periodDatas = gasSensingUpdates.periodUpdates.map(gasSensingUpdate => this.gasSensingUpdateToData(gasSensingUpdate));
        if (firstPeriodMoment.isSame(beginning)) {
          return periodDatas;
        } else {
          return [this.gasSensingUpdateToData(gasSensingUpdates.firstOutOfPeriodUpdate, beginning), ...periodDatas];
        }
      }
    });
  }

  gasSensingUpdateToData(gasSensingUpdate: GasSensingUpdate, m?: moment.Moment): [number, number] {
    return [
      (m ?? this.parseMoment(gasSensingUpdate.localDateTime)).valueOf(),
      gasSensingUpdate.value
    ];
  }

  getIntervals(parameters: { description: string; unit: string }): Observable<GasSensingInterval[]> {
    return this.httpClient.get<GasSensingInterval[]>(
      `${this.urlPrefix}/intervals/${parameters.description}/`,
      { params: new HttpParams().set('unit', parameters.unit) });
  }

  private parseMoment(s: string): moment.Moment {
    return moment(s, this.momentFormat);
  }

  private formatMoment(m: moment.Moment) {
    return m.format(this.momentFormat);
  }
}
