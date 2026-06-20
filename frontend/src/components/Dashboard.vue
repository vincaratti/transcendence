<template>
	<div class="flex flex-col items-center gap-6 p-6 max-w-3xl mx-auto mt-24">
		<h1 class="text-3xl tracking-widest font-bold text-white uppercase">Transcendence</h1>
		<p class="text-zinc-500 text-sm">Create a new game or join an existing one.</p>

		<div class="flex gap-3">
			<button
				@click="startGame"
				class="px-5 py-2 rounded text-sm font-semibold bg-zinc-200 text-zinc-900 hover:bg-white transition-colors"
			>
				Play Codenames
			</button>
			<button
				@click="logout"
				class="px-5 py-2 rounded text-sm font-semibold bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
			>
				Log out
			</button>
		</div>
	</div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { apiFetch, clearAuth } from './utils.js'

const router = useRouter()

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
