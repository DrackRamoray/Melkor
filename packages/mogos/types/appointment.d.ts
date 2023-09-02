import type { Ref } from 'vue';
import type { CellStatus } from '../utils/constants';

export interface DateObj {
  month: string;
  week: {
    date: string;
    short: string;
    weekday: string;
  }[];
}

export type HourAndMinute = `${string}:${string}` | '';

export type TimeRange = [HourAndMinute, HourAndMinute];

export interface Cell {
  index: number; // times index
  rowStart: number; //
  rowEnd: number;
  status: CellStatus;
}

export type Indices = [number, number];

export type MaybeRef<T> = Ref<T> | T;
