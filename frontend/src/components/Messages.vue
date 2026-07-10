<template>
  <div class="chat" @click.self="closeMenu">
  <div v-if="status !== 'authenticated'">Status: {{ status }}</div>
  <div class="messages" ref="messagesContainer" style="max-height: 300px; overflow-y: auto;">
    <div v-for="m in messages" :key="m.id"
    :class="{ 'dm': m.to !== null, 'error': m.type === 'msgToSelf' }">
      
      <span v-if="m.to">[DM → {{ m.to }}] </span>
  <b v-if="m.type !== 'msgToSelf' ">
    <button @click="toggleMenu(m.fromUsername)" class="hover:underline cursor-pointer">
      {{ m.fromUsername }}
    </button>:
    
  </b>
    <span v-else> {{ m.fromUsername }} </span>
   {{ m.content }}
  <div v-if="activeMenu === m.fromUsername"    style="position: absolute; left: 0; top: 90%; z-index: 50; background: #27272a; border: 1px solid #3f3f46; border-radius: 8px; min-width: 150px; padding: 4px 0"
  >
    <button @click="menuAction('dm', m.fromUsername)"       class="menu-item">💬 DM</button>
    <button @click="menuAction('friend', m.fromUsername)"   class="menu-item">➕ Add friend</button>
    <button  v-if="!blockedUsers.has(m.from)"
    @click="menuAction('block', m.fromUsername, m.from)" class="menu-item">🚫 Block</button>
    <button v-else 
    @click="menuAction('unblock', m.fromUsername, m.from)" class="menu-item">✅ Unblock</button>
    <button @click="menuAction('profile', m.fromUsername)"  class="menu-item">👤 See profile</button>
    </div>
  </div>
  </div>
  <div v-if="typing.length">
  <span v-if="typing.length > 3">Multiple people are typing...</span>
  <span v-else-if="typing.length > 1">{{ typing.join(", ") }} are typing...</span>
  <span v-else>{{ typing[0] }} is typing...</span>
  </div>
    <input 
      v-model="text"
      @input="onTyping"
      @keyup.enter="send"
      placeholder="message..."
    />
    <button @click="send">Send</button>
  </div>
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
  messages,
  typing,
  sendMessage,
  sendTyping,
} = useChatSocket({
  url: "https://localhost/ws/chat",
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
// For friend dm
const activeMenu = ref(null)

const toggleMenu = (username) => {
  activeMenu.value = activeMenu.value === username ? null : username
}
const emit = defineEmits(['friend-request'])

const menuAction = async (action, username, userId) => {
  activeMenu.value = null
  if (action === 'dm') {
    text.value = `/w ${username} `
  } else if (action === 'friend') {
    emit('friend-request', username) // delegate to friends.vue
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
  else if (action === 'profile') {
    //show stats idk maybe emit event to stat
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
<style scoped>
.dm {
  color: pink;
  font-style: italic;
}
.error {
  color: red;
  font-style: italic;
}
</style>