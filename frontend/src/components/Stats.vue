<template>
	<div class="min-h-screen bg-zinc-950 text-white">
		<div class="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
			<header class="flex items-center justify-between">
				<h1 class="text-2xl tracking-widest font-bold uppercase">Statistics</h1>
				<RouterLink
					to="/"
					class="px-4 py-1.5 rounded text-xs font-semibold bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
				>
					Back
				</RouterLink>
			</header>

			<StatsOverview />
			<MatchHistory />
			<Leaderboard />
			<Achievements />
		</div>
		<Toast />
	</div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import StatsOverview from './StatsOverview.vue'
import MatchHistory from './MatchHistory.vue'
import Leaderboard from './Leaderboard.vue'
import Achievements from './Achievements.vue'
import Toast from './Toast.vue'
</script>
