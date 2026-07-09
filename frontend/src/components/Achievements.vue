<template>
	<section class="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-4">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold uppercase tracking-wide">Achievements</h2>
			<span v-if="!loading && !error" class="text-xs text-zinc-500">{{ unlockedCount }}/{{ achievements.length }}</span>
		</div>

		<p v-if="loading" class="text-sm text-zinc-500">Loading achievements…</p>
		<p v-else-if="error" class="text-sm text-red-400">{{ error }}</p>
		<p v-else-if="!achievements.length" class="text-sm text-zinc-500">No achievements yet.</p>

		<div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			<div
				v-for="a in achievements"
				:key="a.id"
				class="rounded-lg bg-zinc-800/50 px-4 py-3 flex flex-col gap-2"
				:class="{ 'opacity-50': !a.unlocked }"
			>
				<div class="flex items-center justify-between gap-2">
					<div class="flex items-center gap-2 min-w-0">
						<span v-if="a.icon" class="text-base shrink-0">{{ a.icon }}</span>
						<p class="text-sm font-semibold truncate">{{ a.name }}</p>
					</div>
					<span
						v-if="a.unlocked"
						class="shrink-0 text-xs font-bold text-emerald-400"
						:title="a.unlockedAt ? 'Unlocked ' + formatDate(a.unlockedAt) : 'Unlocked'"
					>✓</span>
					<span v-else class="shrink-0 text-xs text-zinc-600">🔒</span>
				</div>
				<p class="text-xs text-zinc-500">{{ a.description }}</p>
			</div>
		</div>
	</section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from './utils.js'

const loading = ref(true);
const error = ref('');
const achievements = ref([]);

const unlockedCount = computed(() => achievements.value.filter((a) => a.unlocked).length);

function formatDate(d) {
	return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

onMounted(async () => {
	try {
		const res = await apiFetch('/stats/me/achievements');
		if (!res.ok) throw new Error();
		const data = await res.json();
		achievements.value = Array.isArray(data) ? data : (data.entries ?? []);
	} catch {
		error.value = 'Could not load achievements.';
	} finally {
		loading.value = false;
	}
})
</script>
