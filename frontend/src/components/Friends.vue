<template>
	<section class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-6">
		<h2 class="text-lg font-semibold uppercase tracking-wide">Friends</h2>
		<form @submit.prevent="sendRequest" class="flex gap-2">
			<input
				v-model="newFriend"
				type="text"
				placeholder="Add a friend by username"
				class="flex-1 min-w-0 rounded bg-zinc-800/70 px-3 py-2 text-sm placeholder-zinc-500 outline-none focus:ring-1 focus:ring-zinc-500"
			/>
			<button
				type="submit"
				:disabled="!newFriend.trim()"
				class="px-4 py-2 rounded text-sm font-semibold bg-zinc-200 text-zinc-900 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
			>
				Send
			</button>
		</form>
		<p v-if="message" :class="messageOk ? 'text-emerald-400' : 'text-red-400'" class="-mt-4 text-xs">
			{{ message }}
		</p>
		<div v-if="incoming.length" class="flex flex-col gap-2">
			<p class="text-xs uppercase tracking-wide text-zinc-500">Requests</p>
			<div
				v-for="req in incoming"
				:key="req.id"
				class="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-2"
			>
				<span class="text-sm font-medium truncate">{{ req.user.username }}</span>
				<div class="flex gap-2 shrink-0">
					<button
						@click="accept(req.id)"
						class="px-3 py-1 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 transition-colors"
					>
						Accept
					</button>
					<button
						@click="decline(req.id)"
						class="px-3 py-1 rounded text-xs font-semibold bg-zinc-700 hover:bg-zinc-600 transition-colors"
					>
						Decline
					</button>
				</div>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<p class="text-xs uppercase tracking-wide text-zinc-500">My friends</p>
			<p v-if="!friends.length" class="text-sm text-zinc-500">No friends yet.</p>
			<div
				v-for="friend in friends"
				:key="friend.id"
				class="flex items-center justify-between rounded-lg bg-zinc-800/50 px-4 py-2"
			>
				<div class="flex items-center gap-3 min-w-0">
					<div class="relative shrink-0">
						<Avatar :url="friend.avatarUrl" :alt="friend.username" class="w-8 h-8" />
						<span
							:class="onlineIds.has(friend.id) ? 'bg-emerald-400' : 'bg-zinc-600'"
							class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-900"
						/>
					</div>
					<div class="flex flex-col min-w-0">
						<span class="text-sm font-medium truncate">{{ friend.username }}</span>
						<span :class="onlineIds.has(friend.id) ? 'text-emerald-400' : 'text-zinc-500'" class="text-xs">
							{{ onlineIds.has(friend.id) ? 'Online' : 'Offline' }}
						</span>
					</div>
				</div>
					<button
					@click="dm(friend)"
					class="px-3 py-1 rounded text-xs font-semibold text-zinc-400 hover:text-red-400 transition-colors shrink-0"
				>
					DM
				</button>

				<button
					@click="remove(friend.id)"
					class="px-3 py-1 rounded text-xs font-semibold text-zinc-400 hover:text-red-400 transition-colors shrink-0"
				>
					Remove
				</button>
			</div>
		</div>
	</section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { apiFetch } from './utils.js'
import { getSocket } from '../composables/socket.js'
import { showToast } from '../composables/toast.js'
import Avatar from './Avatar.vue'

const friends = ref([])
const incoming = ref([])
const onlineIds = ref(new Set())
const newFriend = ref('')
const message = ref('')
const messageOk = ref(false)

async function loadFriends() {
	const res = await apiFetch('/friends')
	if (res.ok) {
		const data = await res.json()
		friends.value = data
		onlineIds.value = new Set(data.filter((f) => f.online).map((f) => f.id))
	}
}

async function loadRequests() {
	const res = await apiFetch('/friends/requests')
	if (res.ok) {
		const data = await res.json()
		incoming.value = data.incoming
	}
}

function refresh() {
	loadFriends()
	loadRequests()
}

async function sendRequest() {
	const username = newFriend.value.trim();
	if (!username) return;
	const res = await apiFetch('/friends/requests', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username }),
	});
	if (res.ok) {
		const { accepted } = await res.json();
		message.value = '';
		showToast(
			accepted ? `You are now friends with ${username}` : `Request sent to ${username}`
		)
		newFriend.value = '';
		refresh();
	} else {
		const { error } = await res.json().catch(() => ({}));
		messageOk.value = false;
		message.value = error || 'Could not send request';
	}
}

async function accept(id) {
	const res = await apiFetch(`/friends/requests/${id}/accept`, { method: 'POST' });
	if (res.ok) refresh();
}

async function decline(id) {
	const res = await apiFetch(`/friends/requests/${id}/decline`, { method: 'POST' });
	if (res.ok) refresh();
}

async function remove(userId) {
	const res = await apiFetch(`/friends/${userId}`, { method: 'DELETE' });
	if (res.ok) refresh();
}
const emit = defineEmits(['dm'])

function dm(friend) {
  emit('dm', friend.username)
}

const refreshEvents = ['friend-request-received', 'friend-request-accepted', 'friend-removed'];
let socket = null;

function onFriendsOnlineStatus(ids) {
	onlineIds.value = new Set([...onlineIds.value, ...ids])
}

function onFriendOnline({ userId }) {
	const ids = new Set(onlineIds.value)
	ids.add(userId)
	onlineIds.value = ids
}

function onFriendOffline({ userId }) {
	const ids = new Set(onlineIds.value)
	ids.delete(userId)
	onlineIds.value = ids
}

onMounted(() => {
	refresh();
	socket = getSocket()
	refreshEvents.forEach((e) => socket.on(e, refresh));
	socket.on('friends-online-status', onFriendsOnlineStatus)
	socket.on('friend-online', onFriendOnline)
	socket.on('friend-offline', onFriendOffline)
})

onUnmounted(() => {
	if (socket) {
		refreshEvents.forEach((e) => socket.off(e, refresh));
		socket.off('friends-online-status', onFriendsOnlineStatus)
		socket.off('friend-online', onFriendOnline)
		socket.off('friend-offline', onFriendOffline)
	}
})
</script>
