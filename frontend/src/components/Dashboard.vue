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
					<div class="min-w-0 flex-1">
						<h2 class="text-xl font-semibold truncate">{{ displayName }}</h2>
						<p class="text-sm text-zinc-400 truncate">{{ user?.email || '—' }}</p>
						<p class="text-xs text-zinc-500 mt-1">Member since {{ memberSince }}</p>
					</div>
					<button
						type="button"
						@click="toggleEdit"
						class="shrink-0 px-3 py-1.5 rounded text-xs font-semibold bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
					>
						{{ editing ? 'Cancel' : 'Edit profile' }}
					</button>
				</div>

				<form v-if="editing" @submit.prevent="saveProfile" class="mt-6 flex flex-col gap-3 border-t border-zinc-800 pt-5">
					<div class="flex flex-col gap-1">
						<label class="text-xs text-zinc-500 uppercase tracking-wide">Username</label>
						<input
							v-model="editForm.username"
							type="text"
							class="rounded bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500"
							placeholder="New username"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-xs text-zinc-500 uppercase tracking-wide">Email</label>
						<input
							v-model="editForm.email"
							type="email"
							class="rounded bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500"
							placeholder="New email"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-xs text-zinc-500 uppercase tracking-wide">New password</label>
						<input
							v-model="editForm.password"
							type="password"
							class="rounded bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500"
							placeholder="Leave blank to keep current"
						/>
					</div>
					<button
						type="submit"
						:disabled="saving"
						class="self-start mt-1 px-4 py-1.5 rounded text-xs font-semibold bg-zinc-200 text-zinc-900 hover:bg-white transition-colors disabled:opacity-50"
					>
						{{ saving ? 'Saving…' : 'Save changes' }}
					</button>
				</form>

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
			<Friends @dm="startDm"/>
			<Chat :prefill="dmTarget" />
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
import Chat from './Messages.vue'
const router = useRouter()
const user = ref(getStoredUser())
const fileInput = ref(null)
const uploading = ref(false)
const editing = ref(false)
const saving = ref(false)
const editForm = ref({ username: '', email: '', password: '' })

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

function toggleEdit() {
	if (!editing.value) {
		editForm.value = { username: user.value?.username || '', email: user.value?.email || '', password: '' }
	}
	editing.value = !editing.value
}

async function saveProfile() {
	const body = {}
	if (editForm.value.username && editForm.value.username !== user.value?.username)
		body.username = editForm.value.username
	if (editForm.value.email && editForm.value.email !== user.value?.email)
		body.email = editForm.value.email
	if (editForm.value.password)
		body.password = editForm.value.password

	if (!Object.keys(body).length) {
		editing.value = false
		return
	}

	saving.value = true
	try {
		const response = await apiFetch('/users/me', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		})
		const data = await response.json()
		if (!response.ok) {
			showToast(data.error || 'Update failed', { type: 'error' })
			return
		}
		user.value = { ...user.value, ...data.user }
		setStoredUser(user.value)
		editing.value = false
		showToast('Profile updated')
	} catch {
		showToast('Update failed', { type: 'error' })
	} finally {
		saving.value = false
	}
}

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
const dmTarget = ref('')
const startDm = (username) => {
  dmTarget.value = `/w ${username} `
}
</script>
