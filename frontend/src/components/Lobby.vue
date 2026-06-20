<template>
	<div class="flex flex-col items-center gap-6 p-6 max-w-3xl mx-auto">
		<h1 class="text-3xl tracking-widest font-bold text-white">LOBBY</h1>
		<p class="text-zinc-400">
			Game code: <span class="font-mono text-white select-all">{{ game.code }}</span>
		</p>

		<div class="grid grid-cols-2 gap-4 w-full">
			<div
				v-for="team in ['RED', 'BLUE']"
				:key="team"
				class="rounded-lg border p-4"
				:class="team === 'RED'
					? 'border-red-500/30 bg-red-500/5'
					: 'border-blue-500/30 bg-blue-500/5'"
			>
				<h2
					class="text-sm font-bold tracking-widest uppercase mb-4 text-center"
					:class="team === 'RED' ? 'text-red-400' : 'text-blue-400'"
				>
					{{ team }} TEAM
				</h2>

				<div class="space-y-2">
					<div
						v-for="role in ['SPYMASTER', 'OPERATIVE']"
						:key="role"
						class="rounded px-3 py-2 text-sm"
						:class="team === 'RED'
							? 'bg-red-500/10 border border-red-500/20'
							: 'bg-blue-500/10 border border-blue-500/20'"
					>
						<div class="text-[10px] uppercase tracking-wider mb-1"
							:class="team === 'RED' ? 'text-red-500/60' : 'text-blue-500/60'"
						>
							{{ role }}
						</div>

						<div v-if="playerAt(team, role)" class="font-medium text-white">
							{{ playerAt(team, role).user.username }}
						</div>
						<button
							v-else-if="!myPlayer"
							@click="$emit('join', { team, role })"
							class="text-zinc-500 hover:text-white transition-colors cursor-pointer"
						>
							+ Join
						</button>
						<div v-else class="text-zinc-600 italic">Empty</div>
					</div>
				</div>
			</div>
		</div>

		<div class="text-zinc-500 text-sm">
			{{ game.players.length }}/4 players
		</div>

		<button
			v-if="game.players.length === 4"
			@click="$emit('start')"
			class="px-5 py-2 rounded text-sm font-semibold bg-zinc-200 text-zinc-900 hover:bg-white transition-colors"
		>
			Start Game
		</button>
		<div v-else class="text-zinc-600 text-xs">Waiting for all players to join...</div>
	</div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { getStoredUser } from './utils.js'
import { getSocket } from '../composables/socket.js'

const props = defineProps({
	game: { type: Object, required: true },
});

const emit = defineEmits(['start', 'join']);

const currentUser = getStoredUser();
const socket = getSocket();

onMounted(() => {
	socket.emit('join-lobby', props.game.code);
	socket.on('player-joined', (player) => {
		if (!props.game.players.find(p => p.id === player.id)) {
			props.game.players.push(player);
		}
	});
	socket.on('player-left', (userId) => {
		const idx = props.game.players.findIndex(p => p.userId === userId);
		if (idx !== -1) props.game.players.splice(idx, 1);
	});
})

onUnmounted(() => {
	socket.emit('leave-lobby', props.game.code);
	socket.off('player-joined');
	socket.off('player-left');
})

const myPlayer = computed(() =>
	props.game.players.find(p => p.userId === currentUser?.id)
);

function playerAt(team, role) {
	return props.game.players.find(p => p.team === team && p.role === role)
}
</script>
