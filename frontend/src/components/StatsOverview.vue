<template>
	<section class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-6">
		<h2 class="text-lg font-semibold uppercase tracking-wide">Overview</h2>

		<p v-if="loading" class="text-sm text-zinc-500">Loading stats…</p>
		<p v-else-if="error" class="text-sm text-red-400">{{ error }}</p>

		<template v-else>
			<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
				<div class="rounded-lg bg-zinc-800/50 px-4 py-3">
					<p class="text-2xl font-bold">{{ stats.totalGames }}</p>
					<p class="text-xs text-zinc-500 uppercase tracking-wide">Games</p>
				</div>
				<div class="rounded-lg bg-zinc-800/50 px-4 py-3">
					<p class="text-2xl font-bold text-emerald-400">{{ stats.wins }}</p>
					<p class="text-xs text-zinc-500 uppercase tracking-wide">Wins</p>
				</div>
				<div class="rounded-lg bg-zinc-800/50 px-4 py-3">
					<p class="text-2xl font-bold text-red-400">{{ stats.losses }}</p>
					<p class="text-xs text-zinc-500 uppercase tracking-wide">Losses</p>
				</div>
				<div class="rounded-lg bg-zinc-800/50 px-4 py-3">
					<p class="text-2xl font-bold">{{ winRatePct }}%</p>
					<p class="text-xs text-zinc-500 uppercase tracking-wide">Win rate</p>
				</div>
				<div class="rounded-lg bg-zinc-800/50 px-4 py-3">
					<p class="text-2xl font-bold text-red-400">{{ stats.redWins }}</p>
					<p class="text-xs text-zinc-500 uppercase tracking-wide">Red wins</p>
				</div>
				<div class="rounded-lg bg-zinc-800/50 px-4 py-3">
					<p class="text-2xl font-bold text-blue-400">{{ stats.blueWins }}</p>
					<p class="text-xs text-zinc-500 uppercase tracking-wide">Blue wins</p>
				</div>
			</div>

			<div class="h-2 rounded-full bg-zinc-800 overflow-hidden">
				<div
					class="h-full bg-emerald-500 transition-all"
					:style="{ width: winRatePct + '%' }"
				></div>
			</div>
		</template>
	</section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from './utils.js';

const loading = ref(true);
const error = ref('');
const stats = ref({ totalGames: 0, wins: 0, losses: 0, winRate: 0, redWins: 0, blueWins: 0 });

const winRatePct = computed(() => {
	const wr = Number(stats.value.winRate);
	return Number.isNaN(wr) ? 0 : Math.round(wr);
})

onMounted(async () => {
	try {
		const res = await apiFetch('/stats/me');
		if (!res.ok) throw new Error();
		stats.value = { ...stats.value, ...(await res.json()) }
	} catch {
		error.value = 'Could not load stats.';
	} finally {
		loading.value = false;
	}
})
</script>
