<template>
	<div v-if="!game" class="flex justify-center items-center h-64">
		<span class="text-zinc-400">Loading ...</span>
	</div>

	<Lobby v-else-if="game.status === 'WAITING'" :game="game" @start="startGame" @join="joinTeam" @switch="switchTeam" />

	<div v-else class="flex flex-col items-center gap-6 p-6 max-w-3xl mx-auto">
		<div class="flex items-center justify-between w-full">
			<h1 class="text-3xl tracking-widest font-bold text-white">CODENAMES</h1>
		</div>
		<div class="flex items-center justify-between w-full text-sm">
			<div class="flex items-center gap-3">
				<span
					class="inline-block w-3 h-3 rounded-full"
					:class="game.currentTeam === 'RED' ? 'bg-red-500' : 'bg-blue-500'"
				></span>
				<span class="font-semibold uppercase tracking-wide">
					{{ game.currentTeam }} team
				</span>
				<span class="text-zinc-500">&mdash;</span>
				<span class="text-zinc-400">
					{{ game.phase === 'CLUE' ? 'Spymaster gives a clue' : `Guessing (${game.remainingGuess} left)` }}
				</span>
			</div>
			<div class="flex gap-4 text-xs text-zinc-500">
				<span class="text-red-400">{{ redRemaining }} red</span>
				<span class="text-blue-400">{{ blueRemaining }} blue</span>
			</div>
		</div>
		<div
			v-if="game.status === 'FINISHED'"
			class="w-full text-center py-3 rounded font-bold text-lg tracking-wide"
			:class="game.winner === 'RED' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'"
		>
			{{ game.winner }} TEAM WINS!
		</div>
		<div v-if="game.phase === 'CLUE' && game.status === 'IN_PROGRESS'" class="w-full">
			<div v-if="isSpymaster && isMyTurn" class="flex items-end gap-3">
				<div class="flex-1">
					<label class="block text-xs text-zinc-500 mb-1">Clue word</label>
					<input
						v-model="clueWord"
						type="text"
						placeholder="Enter clue..."
						class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
					/>
				</div>
				<div class="w-20">
					<label class="block text-xs text-zinc-500 mb-1">Number</label>
					<input
						v-model.number="clueNumber"
						type="number"
						min="1"
						max="9"
						placeholder="#"
						class="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
					/>
				</div>
				<button
					@click="submitClue"
					:disabled="!clueWord || !clueNumber"
					class="px-5 py-2 rounded text-sm font-semibold transition-colors"
					:class="clueWord && clueNumber
						? 'bg-zinc-200 text-zinc-900 hover:bg-white'
						: 'bg-zinc-800 text-zinc-600 cursor-not-allowed'"
				>
					Give Clue
				</button>
			</div>
			<div v-else class="text-center text-zinc-500 text-sm py-2">
				Waiting for {{ game.currentTeam }} spymaster to give a clue...
			</div>
		</div>
		<div v-if="game.phase === 'GUESS' && game.status === 'IN_PROGRESS'" class="flex items-center gap-4 w-full">
			<div class="flex-1 bg-zinc-900 border border-zinc-700 rounded px-4 py-2 text-sm">
				Clue: <span class="font-bold text-white">{{ game.currentClue }}</span>
				&mdash; <span class="text-zinc-400">{{ game.remainingGuess }} guesses left</span>
			</div>
			<button
				v-if="!isSpymaster && isMyTurn"
				@click="endTurn"
				class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm transition-colors"
			>
				End Turn
			</button>
		</div>
		<div class="grid grid-cols-5 gap-2 w-full">
			<button
				v-for="(card, i) in game.board"
				:key="i"
				@click="guess(i)"
				:disabled="card.revealed || game.phase !== 'GUESS' || game.status !== 'IN_PROGRESS' || isSpymaster || !isMyTurn"
				class="aspect-[5/3] rounded flex items-center justify-center text-xs sm:text-sm font-semibold uppercase tracking-wide transition-all duration-200 border"
				:class="cardClass(card)"
			>
				{{ card.word }}
			</button>
		</div>
		<div v-if="myPlayer" class="text-xs text-zinc-500 select-none">
			You are <span class="text-white">{{ myPlayer.role }}</span> on
			<span :class="myPlayer.team === 'RED' ? 'text-red-400' : 'text-blue-400'">{{ myPlayer.team }}</span> team
		</div>
		<Chat/>

	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { apiFetch, getStoredUser } from './utils.js'
import { getSocket } from '../composables/socket.js'
import Lobby from './Lobby.vue'
import Chat from './Messages.vue'

const route = useRoute();
const socket = getSocket();
const currentUser = getStoredUser();
const game = ref(null);
const clueWord = ref('');
const clueNumber = ref(null);

const myPlayer = computed(() =>
	game.value?.players.find(p => p.userId === currentUser?.id)
);

const isSpymaster = computed(() => myPlayer.value?.role === 'SPYMASTER');

const isMyTurn = computed(() =>
	myPlayer.value?.team === game.value?.currentTeam
);

onMounted(async () => {
	const res = await apiFetch(`/game/${route.params.code}`);
	game.value = await res.json();

	socket.emit('join-lobby', route.params.code);

	socket.on('game-started', (updatedGame) => {
		game.value = updatedGame;
	});
	socket.on('game-updated', (updatedGame) => {
		game.value = updatedGame;
	});
});

onUnmounted(() => {
	socket.emit('leave-lobby', route.params.code);
	socket.off('game-started');
	socket.off('game-updated');
});

async function joinTeam({ team, role }) {
	await apiFetch(`/game/${route.params.code}/join`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ team, role }),
	});
	const res = await apiFetch(`/game/${route.params.code}`);
	game.value = await res.json();
}

async function switchTeam({ team, role }) {
	await apiFetch(`/game/${route.params.code}/switch`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ team, role }),
	});
}

async function startGame() {
	await apiFetch(`/game/${route.params.code}/start`, { method: 'POST' });
}

function submitClue() {
	if (!clueWord.value || !clueNumber.value) return;
	socket.emit('submit-clue', {
		gameCode: route.params.code,
		clue: clueWord.value,
		number: clueNumber.value,
	});
	clueWord.value = '';
	clueNumber.value = null;
}

function guess(index) {
	socket.emit('guess', { gameCode: route.params.code, index });
}

function endTurn() {
	socket.emit('end-turn', { gameCode: route.params.code });
}

const redRemaining = computed(() =>
	game.value?.board.filter(c => c.type === 'RED' && !c.revealed).length ?? 0
)
const blueRemaining = computed(() =>
	game.value?.board.filter(c => c.type === 'BLUE' && !c.revealed).length ?? 0
)

function cardClass(card) {
	if (card.revealed) {
		return {
			'bg-red-500/80 border-red-400 text-white': card.type === 'RED',
			'bg-blue-500/80 border-blue-400 text-white': card.type === 'BLUE',
			'bg-zinc-600/80 border-zinc-500 text-zinc-300': card.type === 'NEUTRAL',
			'bg-zinc-950 border-zinc-400 text-zinc-300': card.type === 'ASSASSIN',
		};
	}

	if (isSpymaster.value) {
		return {
			'bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25': card.type === 'RED',
			'bg-blue-500/15 border-blue-500/40 text-blue-300 hover:bg-blue-500/25': card.type === 'BLUE',
			'bg-zinc-800/50 border-zinc-600/40 text-zinc-400 hover:bg-zinc-700/50': card.type === 'NEUTRAL',
			'bg-zinc-950 border-zinc-500/40 text-zinc-400 hover:bg-zinc-800': card.type === 'ASSASSIN',
		};
	}

	return 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-600 cursor-pointer disabled:cursor-default disabled:hover:bg-zinc-800 disabled:hover:border-zinc-700';
}
</script>
