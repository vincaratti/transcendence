<template>
	<section class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-4">
		<div class="flex items-center justify-between gap-4">
			<h2 class="text-lg font-semibold uppercase tracking-wide">Leaderboard</h2>
			<select
				v-model="metric"
				@change="load"
				class="rounded bg-zinc-800/70 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-zinc-500"
			>
				<option value="wins">Wins</option>
				<option value="winRate">Win rate</option>
				<option value="totalGames">Games played</option>
			</select>
		</div>

		<p v-if="loading" class="text-sm text-zinc-500">Loading leaderboard…</p>
		<p v-else-if="error" class="text-sm text-red-400">{{ error }}</p>
		<p v-else-if="!entries.length" class="text-sm text-zinc-500">No ranked players yet.</p>

		<div v-else class="flex flex-col gap-1">
			<div
				v-for="(e, i) in entries"
				:key="e.userId ?? i"
				class="flex items-center justify-between rounded-lg px-4 py-2 text-sm"
				:class="isMe(e) ? 'bg-zinc-700/60 ring-1 ring-zinc-500' : 'bg-zinc-800/50'"
			>
				<div class="flex items-center gap-3 min-w-0">
					<span class="w-6 text-right text-zinc-500 font-mono">{{ e.rank ?? i + 1 }}</span>
					<span class="font-medium truncate">{{ e.username }}<span v-if="isMe(e)" class="text-zinc-400"> (you)</span></span>
				</div>
				<span class="shrink-0 font-bold tabular-nums">{{ metricValue(e) }}</span>
			</div>
		</div>
	</section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiFetch, getStoredUser } from './utils.js';

const loading = ref(true);
const error = ref('');
const entries = ref([]);
const metric = ref('wins');
const meId = getStoredUser()?.id;

function isMe(e) {
	return meId && e.userId === meId;
}
function metricValue(e) {
	return e[metric.value] ?? e.value ?? '—';
}

async function load() {
	loading.value = true;
	error.value = '';
	try {
		const res = await apiFetch(`/stats/leaderboard?metric=${metric.value}&limit=20`);
		if (!res.ok) throw new Error();
		const data = await res.json();
		entries.value = Array.isArray(data) ? data : (data.leaderboard ?? []);
	} catch {
		error.value = 'Could not load leaderboard.';
	} finally {
		loading.value = false;
	}
}

onMounted(load);
</script>
