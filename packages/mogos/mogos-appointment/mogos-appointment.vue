<template>
  <tm-drawer class="w100" v-model:show="show" placement="bottom" :height="height">
    <view class="w100 family-medium bold">
      <view class="font-xt color-base ptb-l mlr-xl text-ellipse text-center">
        {{ props.title }}
      </view>
      <!--      <c-divider border-type="line-default" mlr="0" :is-hair-line="false" />-->
    </view>
    <view class="w100 flex-column">
      <WeekSwiper :selected-date="props.selectedDate" @update:selected-date="selectDate" />
    </view>
    <scroll-view
      scroll-y
      class="mtb-b appointment__container"
      :class="[isSelected ? 'appointment__container--selected' : '']"
    >
      <view class="appointment__day mlr-l">
        <view class="appointment__nav pr-xs">
          <view
            v-for="(time, index) in times"
            :key="time"
            :style="{ height: itemHeight, lineHeight: index === times.length - 1 ? itemLineHeight : '1.5' }"
          >
            {{ showTime(times, time, endTime, index) }}
          </view>
        </view>
        <view class="appointment__main" :style="{ gridTemplateRows: `repeat(${times.length}, ${itemHeight})` }">
          <template v-for="cell in cells" :key="`${cell.rowStart}-${cell.rowEnd}`">
            <view
              v-if="cell.status === CellStatus.Idle"
              class="radius-default appointment__cell"
              :style="{ gridRowStart: cell.rowStart, gridRowEnd: cell.rowEnd }"
              @click="expandTime(cell)"
            ></view>
            <view
              v-if="cell.status === CellStatus.Selected"
              class="radius-default appointment__cell appointment__cell--selected"
              :style="{ gridRowStart: cell.rowStart, gridRowEnd: cell.rowEnd }"
            >
              <view
                class="color-white appointment__cell--preview"
              >
                {{ selectedTimeDisplay }}
              </view>
              <view
                v-for="r in (cell.rowEnd - cell.rowStart)"
                :key="r"
                class="appointment__cell--selected__item"
                :style="{ height: itemHeight }"
                @click="narrowTime(cell, r - 1)"
              ></view>
            </view>
            <view
              v-if="cell.status === CellStatus.Occupied"
              class="radius-default appointment__cell appointment__cell--occupied"
              :style="{ gridRowStart: cell.rowStart, gridRowEnd: cell.rowEnd }"
            >{{ occupiedText }}</view>
            <view
              v-if="cell.status === CellStatus.Invalid"
              class="radius-default appointment__cell appointment__cell--invalid"
              :style="{ gridRowStart: cell.rowStart, gridRowEnd: cell.rowEnd }"
            >{{ inValidText }}</view>
          </template>
        </view>
      </view>
    </scroll-view>
    <!--    <c-bottom v-if="isSelected">-->
    <!--      <c-button>{{ okText }}</c-button>-->
    <!--    </c-bottom>-->
  </tm-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Cell, HourAndMinute, TimeRange } from '../types/appointment';
import WeekSwiper from './week-swiper.vue';
import { CellStatus, WeekType, WorkMode } from '../utils/constants';
import { showTime } from '../utils/date-fn';
import useAppointment from '../hooks/use-appointment';

interface Props {
  selectedDate: string;
  selectedTimes: TimeRange;
  mode?: WorkMode;
  title?: string;
  startDate?: string;
  endDate?: string;
  weekType?: WeekType;
  startTime?: HourAndMinute;
  endTime?: HourAndMinute;
  interval?: number;
  height?: number;
  okText?: string;
  occupied?: TimeRange[];
  occupiedText?: string;
  invalid?: TimeRange[];
  inValidText?: string;
}

interface Emits {
  (e: 'update:selected-date', v: string): void;
  (e: 'select-date', v: string): void;
  (e: 'update:selected-times', v: TimeRange): void;
  (e: 'select-times'): void;
  (e: 'ok'): void;
}

const props = withDefaults(defineProps<Props>(), {
  mode: WorkMode.View,
  title: '预约',
  startTime: '08:00',
  endTime: '23:00',
  interval: 30,
  height: 74,
  okText: '下一步',
  occupied: () => [],
  occupiedText: '已锁定',
  invalid: () => [],
  inValidText: '不可预约',
});

const emit = defineEmits<Emits>();

const show = ref(true);

const { screenWidth, screenHeight  } = uni.getSystemInfoSync();

const height = ref(screenHeight * 0.9 * 750 / screenWidth);

const { cells, times, isSelected, itemHeight, itemLineHeight, selectedTimeDisplay, isMute, updateSelectedIndex, doExpandTime, doNarrowTime } = useAppointment(props);

const selectDate = (date: string) => {
  updateSelectedIndex(-1, -1);
  emit('update:selected-date', date);
  emit('update:selected-times', ['', '']);
  emit('select-date', date);
};

const expandTime = (cell: Cell) => {
  if (isMute(cell)) {
    return;
  }

  const [startTime, endTime] = doExpandTime(cell);
  emit('update:selected-times', [startTime, endTime]);
  emit('select-times');
};

const narrowTime = (cell: Cell, offset: number) => {
  if (isMute(cell)) {
    return;
  }

  const [startTime, endTime] = doNarrowTime(cell, offset);
  emit('update:selected-times', [startTime, endTime]);
  emit('select-times');
}

defineExpose({
  showAppointment: () => {
    show.value = true;
  },
  hideAppointment: () => {
    show.value = false;
  },
});
</script>

<style scoped lang="scss">
.appointment__container {
  height: calc(100vh - 600rpx);
}
.appointment__container--selected {
  padding-bottom: calc(124rpx + env(safe-area-inset-bottom));
}
.appointment__day {
  display: flex;
  flex-direction: row;
}
.appointment__nav {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}
.appointment__main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rpx;
}
.appointment__cell {
  background-color: #f2f3f4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.appointment__cell--selected {
  background-color: #176bfb;
  position: relative;
}
.appointment__cell--preview {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.appointment__cell--selected__item {
  border: 2rpx solid transparent;
  width: 100%;
}
.appointment__cell--occupied {
  background-color: #03a9f4;
}
.appointment__cell--invalid {
  background-color: #c9cdd4;
}
</style>
