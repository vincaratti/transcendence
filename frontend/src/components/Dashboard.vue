<template>
	<div class="min-h-screen bg-zinc-950 text-white">
		<div class="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
			<header class="flex items-center justify-between">
				<h1 class="text-2xl tracking-widest font-bold uppercase">Transcendence</h1>
				<button
					@click="logout"
					class="px-4 py-1.5 rounded text-xs font-semibold bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
				>
					Log out
				</button>
			</header>
			<section class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
				<div class="flex items-center gap-5">
					<div
						class="shrink-0 w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold uppercase"
					>
						{{ initials }}
					</div>
					<div class="min-w-0">
						<h2 class="text-xl font-semibold truncate">{{ displayName }}</h2>
						<p class="text-sm text-zinc-400 truncate">{{ user?.email || '—' }}</p>
						<p class="text-xs text-zinc-500 mt-1">Member since {{ memberSince }}</p>
					</div>
				</div>

				<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
					<div class="rounded-lg bg-zinc-800/50 px-4 py-3">
						<p class="text-2xl font-bold">{{ totalGames }}</p>
						<p class="text-xs text-zinc-500 uppercase tracking-wide">Games</p>
					</div>
					<div class="rounded-lg bg-zinc-800/50 px-4 py-3">
						<p class="text-2xl font-bold">{{ activeGames }}</p>
						<p class="text-xs text-zinc-500 uppercase tracking-wide">Active</p>
					</div>
					<div class="rounded-lg bg-zinc-800/50 px-4 py-3 col-span-2 sm:col-span-1">
						<p class="text-2xl font-bold">{{ finishedGames }}</p>
						<p class="text-xs text-zinc-500 uppercase tracking-wide">Finished</p>
					</div>
				</div>
			</section>
			<section class="flex flex-col gap-3">
				<p class="text-zinc-500 text-sm">Create a new game or join an existing one.</p>
				<button
					@click="startGame"
					class="self-start px-5 py-2 rounded text-sm font-semibold bg-zinc-200 text-zinc-900 hover:bg-white transition-colors"
				>
					Play Codenames
				</button>
			</section>
		</div>
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch, clearAuth, getStoredUser, setStoredUser } from './utils.js'

const router = useRouter()
const user = ref(getStoredUser())

const displayName = computed(() => user.value?.username || 'Player')

const initials = computed(() => {
	const name = user.value?.username || ''
	return name.slice(0, 2).toUpperCase() || '?'
})

const memberSince = computed(() => {
	if (!user.value?.createdAt) return '—'
	return new Date(user.value.createdAt).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
	})
})

const games = computed(() => user.value?.players?.map((p) => p.game) ?? []);
const totalGames = computed(() => games.value.length);
const activeGames = computed(() =>
	games.value.filter((g) => g?.status && g.status !== 'FINISHED').length
);
const finishedGames = computed(() =>
	games.value.filter((g) => g?.status === 'FINISHED').length
);

onMounted(async () => {
	const response = await apiFetch('/users/me')
	if (response.ok) {
		const data = await response.json();
		user.value = data;
		setStoredUser(data);
	}
});

async function startGame() {
	const response = await apiFetch('/game/create', { method: 'POST' })
	const { code } = await response.json()
	router.push(`/game/${code}`)
}

function logout() {
	clearAuth()
	router.push('/login')
}
</script>
