<template>
	<div class="min-h-screen bg-zinc-950 text-white">
		<div class="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
			<header class="flex items-center justify-between">
				<h1 class="text-2xl tracking-widest font-bold uppercase">Transcendence</h1>
				<div class="flex items-center gap-2">
					<RouterLink
						to="/stats"
						class="px-4 py-1.5 rounded text-xs font-semibold bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
					>
						Stats
					</RouterLink>
					<button
						@click="logout"
						class="px-4 py-1.5 rounded text-xs font-semibold bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
					>
						Log out
					</button>
				</div>
			</header>
			<section class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
				<div class="flex items-center gap-5">
					<div class="relative shrink-0 group">
						<Avatar :url="user?.avatarUrl" :alt="displayName" class="w-16 h-16" />
						<button
							type="button"
							@click="fileInput?.click()"
							:disabled="uploading"
							class="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-[10px] font-semibold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
						>
							{{ uploading ? '…' : 'Change' }}
						</button>
						<input
							ref="fileInput"
							type="file"
							accept="image/png,image/jpeg,image/gif,image/webp"
							class="hidden"
							@change="uploadAvatar"
						/>
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
			<Friends />
		</div>
		<Toast />
	</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch, clearAuth, getStoredUser, setStoredUser } from './utils.js'
import { showToast } from '../composables/toast.js'
import Avatar from './Avatar.vue'
import Friends from './Friends.vue'
import Toast from './Toast.vue'

const router = useRouter()
const user = ref(getStoredUser())
const fileInput = ref(null)
const uploading = ref(false)

const displayName = computed(() => user.value?.username || 'Player')

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

async function uploadAvatar(event) {
	const file = event.target.files?.[0]
	event.target.value = ''
	if (!file) return

	uploading.value = true
	try {
		const formData = new FormData()
		formData.append('avatar', file)
		const response = await apiFetch('/users/me/avatar', { method: 'POST', body: formData })
		const data = await response.json()
		if (!response.ok) {
			showToast(data.error || 'Upload failed', { type: 'error' })
			return
		}
		user.value = { ...user.value, avatarUrl: data.user.avatarUrl }
		setStoredUser(user.value)
		showToast('Avatar updated')
	} catch {
		showToast('Upload failed', { type: 'error' })
	} finally {
		uploading.value = false
	}
}

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
