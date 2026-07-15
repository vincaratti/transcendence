<template>
	<footer class="border-t border-zinc-800 mt-4 pt-5 flex flex-wrap items-center justify-between gap-3">
		<p class="text-xs text-zinc-600">Transcendence</p>
		<nav class="flex items-center gap-4">
			<RouterLink
				to="/privacy"
				class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
			>
				Privacy Policy
			</RouterLink>
			<RouterLink
				to="/terms"
				class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
			>
				Terms of Service
			</RouterLink>
		</nav>
	</footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
