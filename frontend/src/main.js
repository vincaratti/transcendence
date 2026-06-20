import { createApp } from 'vue'
import { RouterView } from 'vue-router'
import router from './router.js'
import './style.css'

createApp(RouterView).use(router).mount('#app')
