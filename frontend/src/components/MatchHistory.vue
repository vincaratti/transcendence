<template>
	<section class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-4">
		<h2 class="text-lg font-semibold uppercase tracking-wide">Match history</h2>

		<p v-if="loading" class="text-sm text-zinc-500">Loading matches…</p>
		<p v-else-if="error" class="text-sm text-red-400">{{ error }}</p>
		<p v-else-if="!matches.length" class="text-sm text-zinc-500">No finished games yet.</p>

		<div v-else class="flex flex-col gap-2">
			<div
				v-for="m in matches"
				:key="m.id"
				class="rounded-lg bg-zinc-800/50 px-4 py-3 flex items-center justify-between gap-4"
			>
				<div class="flex items-center gap-3 min-w-0">
					<span
						class="shrink-0 w-12 text-center px-2 py-1 rounded text-xs font-bold uppercase"
						:class="isWin(m) ? 'bg-emerald-600/20 text-emerald-400' : 'bg-red-600/20 text-red-400'"
					>
						{{ isWin(m) ? 'Win' : 'Loss' }}
					</span>
					<div class="min-w-0">
						<p class="text-sm font-medium truncate">vs {{ opponentNames(m) }}</p>
						<p class="text-xs text-zinc-500 truncate">
							{{ teamLabel(m) }}<span v-if="teammateNames(m)"> · with {{ teammateNames(m) }}</span>
						</p>
					</div>
				</div>
				<span class="shrink-0 text-xs text-zinc-500">{{ formatDate(m.createdAt) }}</span>
			</div>
		</div>
	</section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiFetch } from './utils.js'

const loading = ref(true);
const error = ref('');
const matches = ref([]);

function isWin(m) {
	if (typeof m.result === 'string') return m.result.toUpperCase() === 'WIN';
	return m.team && m.winner && m.team === m.winner;
}

function names(list) {
	return (list || []).map((p) => p.username).filter(Boolean).join(', ');
}
function opponentNames(m) {
	return names(m.opponents) || '—';
}
function teammateNames(m) {
	return names(m.teammates);
}
function teamLabel(m) {
	return m.team ? `Team ${m.team.charAt(0) + m.team.slice(1).toLowerCase()}` : '';
}
function formatDate(d) {
	if (!d) return '';
	return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

onMounted(async () => {
	try {
		const res = await apiFetch('/stats/me/matches?limit=20');
		if (!res.ok) throw new Error();
		const data = await res.json();
		matches.value = Array.isArray(data) ? data : (data.entries ?? []);
	} catch {
		error.value = 'Could not load match history.';
	} finally {
		loading.value = false;
	}
})
</script>
