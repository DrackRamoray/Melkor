import { createSSRApp } from "vue";
import App from "./App.vue";
import tmui from '@melkor/tmui';
import { createPinia } from 'pinia';
import '@melkor/tmui/scss/noNvue.css';
import './uni.scss';

export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();
  app.use(pinia);
  app.use(tmui)
  return {
    app,
  };
}
