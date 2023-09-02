import dayjs, { Dayjs } from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import type { Cell, DateObj, HourAndMinute, Indices, TimeRange } from '../types/appointment';
import { CellStatus } from './constants';

dayjs.extend(weekOfYear);
dayjs.extend(isSameOrBefore);

const genDates = (start: Dayjs, end: Dayjs): DateObj[] => {
  const res = [];
  let week = [];

  for (let i = start; i.isSameOrBefore(end); i = i.add(1, 'day')) {
    week.push({
      date: i.format('YYYY-MM-DD'),
      short: i.format('DD'),
      weekday: i.format('ddd'),
    });

    if (week.length === 7) {
      res.push({
        month: dayjs(week[0].date).format('YYYY年MM月'),
        week,
      });
      week = [];
    }
  }

  return res;
};

const timeToNumber = (timeStr: HourAndMinute) => {
  const [hourStr, minuteStr] = timeStr.split(':');
  return parseInt(hourStr) * 60 + parseInt(minuteStr);
};

const numberToTime = (value: number): HourAndMinute => {
  const hour = `${Math.floor(value / 60)}`;
  const minutes = `${value % 60}`;

  return `${hour.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

export const getDates = (startDate: string, endDate: string) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  return genDates(start, end);
};

export const getDatesByWeek = (startDate: string, endDate: string) => {
  const start = dayjs(startDate).startOf('week');
  const end = dayjs(endDate).endOf('week');

  return genDates(start, end);
};

export const previewSelectedTimes = (selectedTimes: HourAndMinute[]) => {
  const isLegal = Array.isArray(selectedTimes) && selectedTimes.length === 2 && selectedTimes[0] && selectedTimes[1];

  return isLegal ? selectedTimes.join('-') : '';
}

export const isBefore = (cur: string, tar: string) => dayjs(cur).isBefore(tar);

export const isAfter = (cur: string, tar: string) => dayjs(cur).isAfter(tar);

export const isSame = (cur: string, tar: string) => dayjs(cur).isSame(tar);

export const isDisabled = (cur: string, start: string, end: string) =>
  isBefore(cur, start) || isAfter(cur, end);

export const showTime = (times: HourAndMinute[], time: HourAndMinute, endTime: HourAndMinute, index: number) => {
  const isLast = index === times.length - 1;
  const isShow = isLast || time.endsWith('00');

  return isShow ? (isLast ? endTime : time) : '';
};

export const getTimes = (
  startTime: HourAndMinute,
  endTime: HourAndMinute,
  interval: number,
): HourAndMinute[] => {
  const start = timeToNumber(startTime);
  const end = timeToNumber(endTime);
  const res = [];

  for (let i = start; i < end; i += interval) {
    res.push(numberToTime(i));
  }

  return res;
};

export const mergeRanges = (ranges: TimeRange[]): TimeRange[] => {
  if (ranges.length <= 1) {
    return ranges;
  }

  ranges.sort((a, b) => timeToNumber(a[0]) - timeToNumber(b[0]));

  const res = [ranges[0]];

  for (let i = 1; i < ranges.length; i += 1) {
    let n = res.length - 1;

    if (timeToNumber(ranges[i][0]) <= timeToNumber(res[n][1])) {
      if (timeToNumber(ranges[i][1]) > timeToNumber(res[n][1])) {
        res[n][1] = ranges[i][1];
      }
    } else {
      res.push(ranges[i]);
    }
  }

  return res;
}

export const getTimeIndices = (times: HourAndMinute[], rng: TimeRange): Indices => {
  let startIndex = -1;
  let endIndex = -1;
  const start = timeToNumber(rng[0]);
  const end = timeToNumber(rng[1]);

  for (let i = 0; i < times.length; i += 1) {
    const cur = timeToNumber(times[i]);

    if (start <= cur && cur < end) {
      startIndex = startIndex === -1 ? i : startIndex;
      endIndex = i;
    }
  }

  if (startIndex !== -1 && startIndex > 0 && timeToNumber(times[startIndex]) > start) {
    startIndex -= 1;
  }

  return [startIndex, endIndex];
}

const rangeNumber = (indices: Set<number>, start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => indices.add(start + i));

export const getDirtyCellsByIndex = (cells: Cell[], indices: Set<number>, startIndex: number, endIndex: number, status: CellStatus) => {
  if (startIndex === -1 || endIndex === -1) {
    return;
  }

  cells.push({
    index: startIndex,
    rowStart: startIndex + 1,
    rowEnd: endIndex + 2,
    status,
  });

  rangeNumber(indices, startIndex, endIndex);
};

export const getDirtyCellsByRange = (cells: Cell[], indices: Set<number>, times: HourAndMinute[], ranges: TimeRange[], status: CellStatus) => {
  for (const rng of ranges) {
    const [startIndex, endIndex] = getTimeIndices(times, rng);
    getDirtyCellsByIndex(cells, indices, startIndex, endIndex, status);
  }
}

export const getNeatCells = (cells: Cell[], indices: Set<number>, times: HourAndMinute[]) => {
  for (let i = 0; i < times.length; i += 1) {
    if (!indices.has(i)) {
      cells.push({
        index: i,
        rowStart: i + 1,
        rowEnd: i + 2,
        status: CellStatus.Idle,
      })
    }
  }
}

export const isBlocked = (cells: Cell[], startIndex: number, endIndex: number) => {
  for (let i = 0; i < cells.length; i += 1) {
    const isWithin = startIndex <= cells[i].index && cells[i].index <= endIndex;
    const isBlockedStatus = cells[i].status === CellStatus.Occupied || cells[i].status === CellStatus.Invalid;

    if (isWithin && isBlockedStatus) {
      return true;
    }
  }

  return false;
}
