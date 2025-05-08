import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(Vue3Toastify)
app.mount('#app')
