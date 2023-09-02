<template>
  <swiper :current="currentWeek" class="w100 plr-l appointment__swiper">
    <swiper-item v-for="rng in dateRanges" :key="rng.month">
      <view class="color-secondary font-content flex-center bold mtb-s">
        {{ rng.month }}
      </view>
      <view class="w100 flex-plain appointment__week">
        <view
          v-for="day in rng.week"
          :key="day.date"
          class="flex-column radius-default appointment__week-day"
          :class="{
            'appointment__week-day--active': isSame(day.date, props.selectedDate),
            'appointment__week-day--disabled': isDisabled(day.date, props.startDate, props.endDate),
          }"
          @click="selectDate(day)"
        >
          <view class="bold font-title">{{ day.short }}</view>
          <view class="font-desc text-nowrap">{{ day.weekday }}</view>
        </view>
      </view>
    </swiper-item>
  </swiper>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import {
  getDates,
  getDatesByWeek,
  isDisabled,
  isSame,
} from '../utils/date-fn';
import type { DateObj } from '../types/appointment';
import { WeekType } from '../utils/constants';

interface Props {
  selectedDate: string;
  startDate?: string;
  endDate?: string;
  weekType?: WeekType;
}

interface Emits {
  (e: 'update:selected-date', v: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
  weekType: WeekType.Week,
});

const emit = defineEmits<Emits>();

const currentWeek = ref(0);
const dateRanges = computed(() => {
  return props.weekType === WeekType.Date
    ? getDates(props.startDate, props.endDate)
    : getDatesByWeek(props.startDate, props.endDate);
});

const selectDate = (item: DateObj['week'][number]) => {
  if (isDisabled(item.date, props.startDate, props.endDate)) {
    return;
  }

  emit('update:selected-date', item.date);
};
</script>

<style scoped lang="scss">
.appointment__swiper {
  height: 188rpx;
}
.appointment__week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8rpx;
  height: 108rpx;
}
.appointment__week-day {
  background: #f2f3f4;
  justify-content: center;
}
.appointment__week-day--active {
  background-color: #176bfb;
  color: #ffffff;
}
.appointment__week-day--disabled {
  background: #c9cdd4;
  color: #1d2129;
}
</style>
