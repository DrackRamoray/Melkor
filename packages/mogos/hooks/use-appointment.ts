import { computed, ref, unref } from 'vue';
import type { Cell, HourAndMinute, MaybeRef, TimeRange } from '../types/appointment';
import {
  getDirtyCellsByIndex,
  getDirtyCellsByRange,
  getInvalidRanges,
  getNeatCells,
  getTimes,
  isBlocked,
  isPast,
  mergeRanges,
  previewSelectedTimes,
} from '../utils/date-fn';
import { CellStatus, WorkMode } from '../utils/constants';

interface Props {
  mode: WorkMode;
  selectedDate: string;
  selectedTimes: TimeRange;
  startTime: HourAndMinute;
  endTime: HourAndMinute;
  interval: number;
  height: number;
  occupied: TimeRange[];
  invalid: TimeRange[];
}

const useAppointment = (props: Props) => {
  const dirtyIndices = new Set<number>();
  const selectedStartIndex = ref(-1);
  const selectedEndIndex = ref(-1);

  const isSelected = computed(
    () => Array.isArray(props.selectedTimes) && props.selectedTimes[0] && props.selectedTimes[1],
  );

  const times = computed(() => getTimes(props.startTime, props.endTime, props.interval));

  const occupiedRanges = computed(() => mergeRanges(props.occupied));

  const invalidRanges = computed(() => props.mode === WorkMode.Edit ? getInvalidRanges(
    props.selectedDate,
    times.value,
    props.endTime,
    occupiedRanges.value,
    props.invalid,
  ) : mergeRanges(props.invalid));

  const itemHeight = computed(() => `${props.height}rpx`);

  const itemLineHeight = computed(() => `${props.height * 1.5}rpx`);

  const selectedTimeDisplay = computed(() => previewSelectedTimes(props.selectedTimes));

  const cells = computed(() => {
    const res: Cell[] = [];
    dirtyIndices.clear();

    getDirtyCellsByRange(res, dirtyIndices, times.value, occupiedRanges.value, CellStatus.Occupied);
    getDirtyCellsByRange(res, dirtyIndices, times.value, invalidRanges.value, CellStatus.Invalid);
    getDirtyCellsByIndex(res, dirtyIndices, selectedStartIndex.value, selectedEndIndex.value, CellStatus.Selected);
    getNeatCells(res, dirtyIndices, times.value);

    res.sort((a, b) => a.index - b.index);

    return res;
  });

  const isMute = (cell: MaybeRef<Cell>) => {
    if (props.mode === WorkMode.View) {
      return true;
    }

    return isPast(times.value[unref(cell).index], props.selectedDate);
  };

  const updateSelectedIndex = (startIndex: number, endIndex: number) => {
    selectedStartIndex.value = startIndex;
    selectedEndIndex.value = endIndex;
  };

  const updateSelectedTime = (startIndex: number, endIndex: number) => {
    const rawTimes = unref(times);
    const startTime = rawTimes[startIndex];
    const endTime = endIndex === rawTimes.length - 1 ? props.endTime : rawTimes[endIndex + 1];

    updateSelectedIndex(startIndex, endIndex);

    return [startTime, endTime];
  };

  const doExpandTime = (cell: MaybeRef<Cell>) => {
    const rawCell = unref(cell);
    const rawCells = unref(cells);

    let startIndex = unref(selectedStartIndex) === -1 ? rawCell.index : unref(selectedStartIndex);
    let endIndex = unref(selectedEndIndex) === -1 ? rawCell.index : unref(selectedEndIndex);

    if (rawCell.index <= startIndex) {
      [startIndex, endIndex] = isBlocked(rawCells, rawCell.index, startIndex) ? [rawCell.index, rawCell.index] : [rawCell.index, endIndex];
    } else if (rawCell.index >= endIndex) {
      [startIndex, endIndex] = isBlocked(rawCells, endIndex, rawCell.index) ? [rawCell.index, rawCell.index] : [startIndex, rawCell.index];
    }

    return updateSelectedTime(startIndex, endIndex);
  };

  const doNarrowTime = (cell: MaybeRef<Cell>, offset: number) => {
    const index = unref(cell).index + offset;

    return updateSelectedTime(index, index);
  };

  return {
    isSelected,
    itemHeight,
    itemLineHeight,
    selectedTimeDisplay,
    times,
    cells,
    isMute,
    updateSelectedIndex,
    doExpandTime,
    doNarrowTime,
  };
};

export default useAppointment;
