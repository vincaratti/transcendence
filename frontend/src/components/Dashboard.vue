<template>
	<div class="flex flex-col items-center gap-6 p-6 max-w-3xl mx-auto">
		<h1 class="text-3xl tracking-widest font-bold text-white">DASHBOARD</h1>
		<p class="text-zinc-400 text-sm">Create a new game or join an existing one.</p>
		<button
			@click="startGame"
			class="px-5 py-2 rounded text-sm font-semibold bg-zinc-200 text-zinc-900 hover:bg-white transition-colors"
		>
			Play Codenames
		</button>
	</div>
</template>

<script setup>
	import { useRouter } from 'vue-router';

	const router = useRouter();

	async function startGame() {
		const response = await fetch('/api/game/create', { method: "POST" });
		const { code } = await response.json();
		router.push(`/game/${code}`);
	}
</script>
