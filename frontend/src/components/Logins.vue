<template>
	<div class="flex flex-col items-center gap-6 p-6 max-w-sm mx-auto mt-24">
		<h1 class="text-3xl tracking-widest font-bold text-white uppercase">transcendence</h1>
		<div class="w-full bg-zinc-900 border border-zinc-700 rounded p-6">
			<div class="flex gap-1 mb-6">
				<button
					@click="mode = 'login'"
					class="flex-1 py-2 text-sm font-semibold uppercase tracking-wide rounded transition-colors"
					:class="mode === 'login'
						? 'bg-zinc-200 text-zinc-900'
						: 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'"
				>
					Log in
				</button>
				<button
					@click="mode = 'signup'"
					class="flex-1 py-2 text-sm font-semibold uppercase tracking-wide rounded transition-colors"
					:class="mode === 'signup'
						? 'bg-zinc-200 text-zinc-900'
						: 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'"
				>
					Sign up
				</button>
			</div>

			<form @submit.prevent="submit" class="flex flex-col gap-4">
				<div v-if="mode === 'signup'">
					<label for="username" class="block text-xs text-zinc-500 mb-1">Username</label>
					<input
						id="username"
						v-model="username"
						type="text"
						:maxlength="USERNAME_MAX"
						autocomplete="username"
						placeholder="Choose a username"
						class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
					/>
				</div>

				<div>
					<label for="email" class="block text-xs text-zinc-500 mb-1">Email</label>
					<input
						id="email"
						v-model="email"
						type="email"
						autocomplete="email"
						placeholder="you@example.com"
						class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
					/>
				</div>

				<div>
					<label for="password" class="block text-xs text-zinc-500 mb-1">Password</label>
					<input
						id="password"
						v-model="password"
						type="password"
						:maxlength="PASSWORD_MAX"
						:autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
						placeholder="Enter your password"
						class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
					/>
					<p v-if="mode === 'signup'" class="mt-1 text-xs text-zinc-600">
						At least 8 characters, including a letter and a number.
					</p>
				</div>

				<button
					type="submit"
					:disabled="loading"
					class="w-full py-2 rounded text-sm font-semibold uppercase tracking-wide transition-colors mt-2"
					:class="loading
						? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
						: 'bg-zinc-200 text-zinc-900 hover:bg-white'"
				>
					{{ mode === 'login' ? 'Log in' : 'Create account' }}
				</button>
			</form>

			<p v-if="error" class="mt-4 text-sm text-red-400 text-center">{{ error }}</p>
		</div>
		<p class="text-xs text-zinc-600 text-center">
			By creating an account you agree to our
			<RouterLink to="/terms" class="text-zinc-400 underline underline-offset-2 hover:text-zinc-200">
				Terms of Service</RouterLink>
			and
			<RouterLink to="/privacy" class="text-zinc-400 underline underline-offset-2 hover:text-zinc-200">
				Privacy Policy</RouterLink>.
		</p>
		<div class="w-full">
			<Footer />
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { setAuthToken, setStoredUser } from './utils.js'
import { emailError, newPasswordError, usernameError, PASSWORD_MAX, USERNAME_MAX } from '../validation.js'
import Footer from './Footer.vue'

const router = useRouter()

const mode = ref('login')
const username = ref('')
const email = ref('')
const password = ref('')
const error = ref(null)
const loading = ref(false)

async function submit() {
	error.value = null

	if (mode.value === 'signup') {
		await signup()
	} else {
		await login()
	}
}

async function login() {
	if (!email.value || !password.value) {
		error.value = 'All fields are required'
		return
	}

	loading.value = true
	try {
		const response = await fetch('/api/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: email.value,
				password: password.value,
			}),
		})

		const data = await response.json()

		if (response.ok) {
			setAuthToken(data.accessToken)
			setStoredUser(data.user)
			router.push('/')
		} else {
			error.value = data.error?.message || 'Invalid credentials'
		}
	} catch {
		error.value = 'Server error'
	} finally {
		loading.value = false
	}
}

async function signup() {
	error.value = usernameError(username.value) || emailError(email.value) || newPasswordError(password.value)
	if (error.value) {
		return
	}

	loading.value = true
	try {
		const response = await fetch('/api/auth/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: username.value,
				email: email.value,
				password: password.value,
			}),
		})

		const data = await response.json()

		if (response.status === 201) {
			setAuthToken(data.accessToken)
			setStoredUser(data.user)
			router.push('/')
		} else {
			error.value = data.error?.message || 'Signup failed'
		}
	} catch {
		error.value = 'Server error'
	} finally {
		loading.value = false
	}
}
</script>
