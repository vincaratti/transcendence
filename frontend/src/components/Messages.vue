<template>
	<section class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-4" @click.self="closeMenu">
		<div class="flex items-center justify-between gap-3">
			<h2 class="text-lg font-semibold uppercase tracking-wide">Chat</h2>
			<span v-if="status !== 'authenticated'" class="text-xs text-zinc-500 truncate">
				{{ status }}<span v-if="lastError" class="text-red-400"> ({{ lastError }})</span>
			</span>
		</div>

		<div
			ref="messagesContainer"
			class="flex flex-col gap-1 h-72 overflow-y-auto rounded-lg bg-zinc-800/50 px-4 py-3"
		>
			<p v-if="!messages.length" class="text-sm text-zinc-500">No messages yet.</p>
			<div v-for="m in messages" :key="m.id" class="relative text-sm leading-relaxed break-words">
				<span v-if="m.to" class="text-xs font-medium text-pink-400">[DM → {{ m.to }}]</span>
				<template v-if="m.type !== 'msgToSelf'">
					<button
						@click="toggleMenu(m.id)"
						class="font-semibold text-zinc-200 hover:underline cursor-pointer"
					>
						{{ m.fromUsername }}</button><span class="text-zinc-500">:</span>
				</template>
				<span v-else class="font-semibold text-red-400">{{ m.fromUsername }}:</span>
				<span :class="contentClass(m)">{{ m.content }}</span>
				<div
					v-if="activeMenu === m.id"
					class="absolute left-0 top-full z-50 mt-1 min-w-[150px] rounded-lg border border-zinc-700 bg-zinc-800 py-1 shadow-lg shadow-black/40"
				>
					<button @click="menuAction('dm', m.fromUsername)" class="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors">💬 DM</button>
					<button
						v-if="!blockedUsers.has(m.from)"
						@click="menuAction('block', m.fromUsername, m.from)"
						class="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
					>🚫 Block</button>
					<button
						v-else
						@click="menuAction('unblock', m.fromUsername, m.from)"
						class="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700 transition-colors"
					>✅ Unblock</button>
				</div>
			</div>
		</div>

		<p class="h-4 text-xs italic text-zinc-500">
			<template v-if="typing.length > 3">Multiple people are typing...</template>
			<template v-else-if="typing.length > 1">{{ typing.join(", ") }} are typing...</template>
			<template v-else-if="typing.length === 1">{{ typing[0] }} is typing...</template>
		</p>

		<div class="flex gap-2">
			<input
				v-model="text"
				@input="onTyping"
				@keyup.enter="send"
				placeholder="Message, or /w <user> to whisper"
				class="flex-1 min-w-0 rounded bg-zinc-800/70 px-3 py-2 text-sm placeholder-zinc-500 outline-none focus:ring-1 focus:ring-zinc-500"
			/>
			<button
				@click="send"
				:disabled="!text.trim()"
				class="px-4 py-2 rounded text-sm font-semibold bg-zinc-200 text-zinc-900 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
			>
				Send
			</button>
		</div>
	</section>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
import { useChatSocket } from "../composables/chat.js";
import { apiFetch } from './utils.js'
const text = ref("");
const Status = ref("connecting");
const blockedUsers = ref(new Set())
const messagesContainer = ref(null); // to scroll down when mounting
var sentTo = null;
const {
  status,
  lastError,
  messages,
  typing,
  sendMessage,
  sendTyping,
} = useChatSocket({
  url: "/ws/chat",
  token: localStorage.getItem("authToken"),
});
const Whispering = (message) => {
  const whisperRegex = /^\/w\s+(\S+)\s+(.+)/
  const match = message.match(whisperRegex)
  if (match) {
    return { to: match[1], content: match[2] }
  }
  return null
};

const send = async () => {
  const whisper = Whispering(text.value)
  const inviteRegex = /^\/invite\s+(\w+)\s+(\w+)/
  const inviteMatch = text.value.match(inviteRegex)
  const blockRegex = /^\/block\s+(\w+)/
  const blockMatch = text.value.match(blockRegex)
  const unblockRegex = /^\/unblock\s+(\w+)/
  const unblockMatch = text.value.match(unblockRegex)
  if (inviteMatch) {
    const username = inviteMatch[1]
    const gameCode = inviteMatch[2]

  }
  else if (blockMatch) {
    const username = blockMatch[1]
    const res = await apiFetch(`/blocks/${username}`, { method: 'POST' })
    if (!res.ok) {
      const err = await res.json()
      console.error('failed to block user:', err.error)
    }
  }
  else if (unblockMatch) {
    const username = unblockMatch[1]
    const res = await apiFetch(`/blocks/${username}`, { method: 'DELETE' })
    if (!res.ok) {
      const err = await res.json()
      console.error('failed to unblock user:', err.error)
    }
  }
  else if (!whisper) {
    sendMessage(text.value)
  } else {
    sendMessage(whisper.content, whisper.to)
  }
  text.value = ""
};


// this deals with the typing indication the logic is in the backend entirely
const onTyping = () => {
  sendTyping();
};
// For friend dm, keyed by message id so the menu opens on one line only
const activeMenu = ref(null)

const toggleMenu = (messageId) => {
  activeMenu.value = activeMenu.value === messageId ? null : messageId
}

const contentClass = (m) => {
  if (m.type === 'msgToSelf') return 'text-red-400 italic'
  if (m.to) return 'text-pink-300 italic'
  return 'text-zinc-300'
}
const menuAction = async (action, username, userId) => {
  activeMenu.value = null
  if (action === 'dm') {
    text.value = `/w ${username} `
  } else if (action === 'block') {
      if (!userId) {
        console.error('no userId for block')
      return
    }
      try {
        const res = await apiFetch(`/blocks/${userId}`, { method: 'POST' })
        if (res.ok) {
          blockedUsers.value = new Set([...blockedUsers.value, userId])
        } else {
          const err = await res.json()
          console.error('failed to block user:', err.error)
        }
      } catch (e) {
        console.error('failed to block user', e)
      }

  } else if (action === 'unblock') {
      if (!userId) {
        console.error('no userId for unblock')
        return
      }
      try {
        const res = await apiFetch(`/blocks/${userId}`, { method: 'DELETE' })
        if (res.ok) {
          blockedUsers.value.delete(userId)
          blockedUsers.value = new Set(blockedUsers.value)
        } else {
          const err = await res.json()
          console.error('failed to unblock user:', err.error)
        }
      } catch (e) {
        console.error('failed to unblock user', e)
      }
  }
}

const closeMenu = () => activeMenu.value = null

const props = defineProps({ prefill: String })
watch(() => props.prefill, (val) => {
  if (val) text.value = val
})
let hasScrolledInitially = false;
let debounceTimer = null;

watch(() => messages.value.length, () => {
  if (hasScrolledInitially) return;

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    hasScrolledInitially = true;
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    });
  }, 150); // 150 ms period looping then act once and never cares again
})

onMounted(async () => {
    const res = await apiFetch('/blocks')
  if (res.ok) {
    const ids = await res.json()
    blockedUsers.value = new Set(ids)
  }
  else {
    console.error('failed to fetch blocked users')
  }
  const observer = new IntersectionObserver((entries) => 
  { const visibleIds = entries .filter(e => e.isIntersecting)
    .map(e => e.target.dataset.messageId);
    if (visibleIds.length)
      sendReadReceipts(visibleIds);
     },{ threshold: 0.8 });
  
})
</script>
