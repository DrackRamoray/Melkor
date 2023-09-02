<template>
  <tm-app>
    <view style="{height: '100rpx', marginTop: '100rpx'}">abcd</view>
    <mogos-appointment
      ref="mogos"
      v-model:selected-date="selectedDate"
      v-model:selected-times="selectedTimes"
      :occupied="occupied"
      :invalid="invalid"
      @select-date="selectDate"
      @select-times="selectTimes"
    />
    <tm-button @click="openDrawer">open</tm-button>
  </tm-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs';
import { TimeRange } from '@melkor/mogos/types/appointment';

const mogos = ref<any>(null);
const selectedDate = ref(dayjs().format('YYYY-MM-DD'));
const selectedTimes = ref<[string, string]>(['', '']);
const occupied = ref<TimeRange[]>([]);
const invalid = ref<TimeRange[]>([]);

const openDrawer = () => {
  mogos.value?.showAppointment();
};

const selectDate = () => {
  console.log('|>> select date ....', selectedDate.value, Math.floor(Math.random() * 10) % 2);
  occupied.value = Math.floor(Math.random() * 10) % 2 === 0 ? [['08:15', '11:35']] : [['13:15', '14:01']];
  invalid.value = Math.floor(Math.random() * 10) % 2 === 0 ? [['17:15', '18:35']] : [['19:15', '21:01']];
}

const selectTimes = () => {
  console.log('....', selectedTimes.value);
}
</script>

<style></style>
