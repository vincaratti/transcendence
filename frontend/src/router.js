import { createRouter, createWebHistory } from 'vue-router'
import { getAuthToken } from './components/utils.js'
import Logins from './components/Logins.vue'
import Codenames from './components/Codenames.vue'
import Dashboard from './components/Dashboard.vue'
import Stats from './components/Stats.vue'
import Privacy from './components/Privacy.vue'
import Terms from './components/Terms.vue'
import NotFound from './components/NotFound.vue'

const routes = [
	{ path: '/login', component: Logins, meta: { guest: true } },
	{ path: '/privacy', component: Privacy, meta: { guest: true } },
	{ path: '/terms', component: Terms, meta: { guest: true } },
	{ path: '/game/:code', component: Codenames },
	{ path: '/stats', component: Stats },
	{ path: '/', component: Dashboard },
	{ path: '/:pathMatch(.*)*', component: NotFound, meta: { guest: true } },
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
