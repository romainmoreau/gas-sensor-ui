export type UnitName = "m" | "h" | "d";

export interface Unit {
  name: UnitName;
  values: number[];
}

export interface UnitValue {
  name: UnitName;
  value: number;
}
