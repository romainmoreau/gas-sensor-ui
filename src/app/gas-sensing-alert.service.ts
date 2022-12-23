import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GasSensingAlert } from "./gas-sensing-alert";

@Injectable({
  providedIn: "root",
})
export class GasSensingAlertService {
  private urlPrefix = "/api";

  constructor(private httpClient: HttpClient) {}

  getAlert(
    sensorName: string,
    description: string,
    unit: string
  ): Observable<GasSensingAlert> {
    return this.httpClient.get<GasSensingAlert>(
      `${this.urlPrefix}/alert/${sensorName}/${description}`,
      { params: new HttpParams().set("unit", unit) }
    );
  }

  postAlert(gasSensingAlert: GasSensingAlert): Observable<GasSensingAlert> {
    return this.httpClient.post<GasSensingAlert>(
      `${this.urlPrefix}/alert`,
      gasSensingAlert
    );
  }

  deleteAlert(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.urlPrefix}/alert/${id}`);
  }
}
