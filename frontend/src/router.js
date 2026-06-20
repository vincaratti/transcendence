import { createRouter, createWebHistory } from 'vue-router'
import { getAuthToken } from './components/utils.js'
import Logins from './components/Logins.vue'
import Codenames from './components/Codenames.vue'
import Dashboard from './components/Dashboard.vue'

const routes = [
	{ path: '/login', component: Logins, meta: { guest: true } },
	{ path: '/game/:code', component: Codenames },
	{ path: '/', component: Dashboard },
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

router.beforeEach((to) => {
	const token = getAuthToken()
	if (!to.meta.guest && !token) {
		return '/login'
	}
	if (to.path === '/login' && token) {
		return '/'
	}
})

export default router
