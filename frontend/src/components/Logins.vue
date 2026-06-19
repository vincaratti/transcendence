<template>
  <div class="login-container">
    <button data-testid="login-button" @click="login" v-if="!LoggedIn">
      Login
    </button>

    <button data-testid="signup-button" @click="signup" v-if="!LoggedIn">
      Sign up
    </button>
    <p v-if="LoggedIn">Welcome, {{ username }}!</p>
    <p v-if="error" class="error"> {{ error }}    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { API_URL } from '@/config.js'

const LoggedIn = ref(false)
const username = ref('')
const error = ref(null)

const emit = defineEmits(['logged-in'])

async function login() {
  const mail = prompt("Enter your email:")
  const pass = prompt("Enter your password:")

  if (!mail || !pass)
  {
      error.value = "All fields are required"
      return
  }
  

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: mail,
        password: pass
      })
    })

    const data = await response.json()

    if (response.ok) {
      LoggedIn.value = true
      username.value = data.user.username

      emit('logged-in', data.user, data.accessToken)

      error.value = null
    } else {
      error.value = data.error?.message || 'Invalid credentials'
      alert(error.value)
    }
  } catch (err) {
    error.value = err.message
    alert('Server error')
  }
}

async function signup() {
  const user = prompt("Enter your username:")
  const mail = prompt("Enter your email:")
  const pass = prompt("Enter your password:")

  if (!user || !mail || !pass) {
    error.value = "All fields are required"
    return
  }

  if (user.length > 20) {
    error.value = "Please choose a name under 21 characters"
    return
  }

  if (pass.length > 20) {
    error.value = "Please choose a password under 21 characters"
    return
  }

  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: user,
      email: mail,
      password: pass
    })
  })

  const data = await response.json()

  if (response.status === 201) {
    LoggedIn.value = true
    username.value = user
    emit('logged-in', user, data.accessToken)
  } else {
    error.value = data.error?.message || 'Signup failed'
    alert(error.value)
  }
}
</script>
<style scoped>
.login-container {
  text-align: center;
}
.error {
  color: rgb(240, 58, 58);
}

button {
  margin: 15px;
}
</style>