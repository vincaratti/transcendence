import { createRouter, createWebHistory } from 'vue-router'
import Logins from './components/Logins.vue'
import Codenames from './components/Codenames.vue'
import Dashboard from './components/Dashboard.vue'

const routes = [
	{ path: '/login', component: Logins },
	{ path: '/game/:code', component: Codenames },
	{ path: '/', component: Dashboard },
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

export default router
