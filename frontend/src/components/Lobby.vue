<template>
	<div class="flex flex-col items-center gap-6 p-6 max-w-3xl mx-auto">
		<h1 class="text-3xl tracking-widest font-bold text-white">LOBBY</h1>
		<p class="text-zinc-400">Game code: <span class="font-mono text-white">{{ game.code }}</span></p>
		<div class="text-zinc-500 text-sm">Waiting for players...</div>
		<button
			@click="$emit('start')"
			class="px-5 py-2 rounded text-sm font-semibold bg-zinc-200 text-zinc-900 hover:bg-white transition-colors"
		>
			Start Game
		</button>
	</div>
</template>

<script setup>
defineProps({
	game: { type: Object, required: true },
})

defineEmits(['start'])
</script>
