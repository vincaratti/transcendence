import { createRouter, createWebHistory } from 'vue-router'
import Logins from './components/Logins.vue'
import Codenames from './components/Codenames.vue'

const routes = [
	{ path: '/', component: Logins },
	{ path: '/game', component: Codenames },
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
