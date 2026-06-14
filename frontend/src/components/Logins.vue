<template>
  <div class="login-container">
    <h1>TRANSCENDENCE</h1>
    <button @click="login"v-if="!LoggedIn">
      Login
    </button>

    <button @click="signup"v-if="!LoggedIn">
    Sign up
    </button>
    <p v-if="LoggedIn">Welcome, {{ username }}!</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { API_URL } from '@/config.js'

// state (replaces data())
const LoggedIn = ref(false)
const username = ref('')

// emits (replaces this.$emit)
const emit = defineEmits(['logged-in'])

async function login() {
  console.log('Login clicked')

  const user = prompt("Enter your username:")
  const pass = prompt("Enter your password:")

  if (!user || !pass) return

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: user,
        password: pass
      })
    })

    if (response.ok) {
      LoggedIn.value = true
      username.value = user
      emit('logged-in', user)
    } else {
      alert('Invalid credentials')
    }

  } catch (err) {
    console.error('Login error:', err)
    alert('Server error')
  }
}

function signup() {
  console.log('Sign up clicked')
}
</script>
<style scoped>
.login-container {
  text-align: center;
}

button {
  margin: 10px;
}
</style>