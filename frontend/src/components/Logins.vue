<template>
  <div class="login-container">
    <button data-testid="login-button" @click="login" v-if="!LoggedIn">
      Login
    </button>

    <button data-testid="signup-button" @click="signup" v-if="!LoggedIn">
      Sign up
    </button>
    <p v-if="LoggedIn">Welcome, {{ username }}!</p>
    <p v-if="error">{{ error }}    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { API_URL } from '@/config.js'

const LoggedIn = ref(false)
const username = ref('')

const emit = defineEmits(['logged-in'])

async function login() {
  //console.log('Login clicked')
    const [error, setError] = useState(null);
  const user = prompt("Enter your username:")
  if (user.length > 20)
  {
    throw("Please chose a name under 21 characters")
  }
    //chose smaller name
  const pass = prompt("Enter your password:")
    if (pass.length > 20)
    {
            throw("Please chose a password under 21 characters")

    }
    //chose

  if (!user || !pass) return

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email   : mail,
        password: pass
      })
    })

    if (response == 200) {
      LoggedIn.value = true
      username.value = user
      emit('logged-in', user)
    } else {
      alert('Invalid credentials')
    }
    setError(null);
  } catch (err) {
    setError('Login error:', err)
    alert('Server error')
  }
}

async function signup() {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: user,
        email   : mail,
        password: pass
      })
    })

    if (response == 201) {
      LoggedIn.value = true
      username.value = user
      emit('logged-in', user)
    } else {
      alert('Invalid credentials')
    }
  //console.log('Sign up clicked')
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