// template is what is rendered to the DOM
// script is logic related to ins and out of said template
// style is css for template maybe we want tailwind css instead

<template>
  <Logins
    v-if="screen === Screen.LOGIN"
    @logged-in="handleLoggedIn"
  />

  <template v-else-if="screen === Screen.LOBBY">
    <preGameChat />

    <button @click="screen = Screen.SINGLEPLAYER">
      Singleplayer
    </button>

    <button @click="screen = Screen.MULTIPLAYER" v-if="currentUser"> // do we want unconnected people to see multiplayer
      Multiplayer
    </button>
  </template>

  <Singleplayer
    v-else-if="screen === Screen.SINGLEPLAYER"
  />

  <Multiplayer
    v-else-if="screen === Screen.MULTIPLAYER"
    :username="currentUser"
  />
</template>

<script setup>
import { ref } from 'vue'

import Logins from './components/Logins.vue'
import Singleplayer from './components/Singleplayer.vue'
import Multiplayer from './components/Multiplayer.vue'
import preGameChat from './components/PreGameChat.vue'

const Screen = Object.freeze({
  LOGIN: 'login',
  LOBBY: 'lobby',
  SINGLEPLAYER: 'singleplayer',
  MULTIPLAYER: 'multiplayer',
})

const screen = ref(Screen.LOGIN)
const currentUser = ref(null)

function handleLoggedIn(user) {
  currentUser.value = user
  screen.value = Screen.LOBBY
}
</script>