import { GasSensingUpdate } from "./gas-sensing-update";

export interface GasSensingUpdates {
  periodUpdates: GasSensingUpdate[];
  firstOutOfPeriodUpdate: GasSensingUpdate;
}
