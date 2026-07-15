<template>
	<div class="min-h-screen bg-zinc-950 text-white">
		<div class="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8">
			<header class="flex items-center justify-between">
				<h1 class="text-2xl tracking-widest font-bold uppercase">Arcade</h1>
				<RouterLink
					to="/"
					class="px-4 py-1.5 rounded text-xs font-semibold bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
				>
					Back
				</RouterLink>
			</header>

			<section class="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
				<iframe
					src="/games/godot/game.html"
					title="Godot game"
					class="block w-full aspect-video border-0"
					allow="autoplay; fullscreen; gamepad"
				></iframe>
			</section>

			<p class="text-xs text-zinc-500">
				Click inside the frame to give the game keyboard focus.
			</p>

			<Footer />
		</div>
	</div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import Footer from './Footer.vue'
</script>
