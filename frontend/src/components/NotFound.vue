<template>
	<div class="min-h-screen bg-zinc-950 text-white">
		<div class="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-8 min-h-screen">
			<div class="flex-1 flex flex-col items-center justify-center gap-4 text-center">
				<p class="text-6xl font-bold tracking-widest text-zinc-700">404</p>
				<h1 class="text-xl font-semibold">This page does not exist</h1>
				<RouterLink
					to="/"
					class="mt-2 px-5 py-2 rounded text-sm font-semibold bg-zinc-200 text-zinc-900 hover:bg-white transition-colors"
				>
					Go to dashboard
				</RouterLink>
			</div>
			<Footer />
		</div>
	</div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import Footer from './Footer.vue'
</script>
