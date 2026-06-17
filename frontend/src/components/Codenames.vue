<template>
  <div class="flex flex-col items-center gap-6 p-6 max-w-3xl mx-auto">
    <div class="flex items-center justify-between w-full">
      <h1 class="text-3xl tracking-widest font-bold text-white">CODENAMES</h1>
      <button
        @click="newGame"
        class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm tracking-wide transition-colors"
      >
        New Game
      </button>
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
          {{ game.phase === 'clue' ? 'Spymaster gives a clue' : `Guessing (${game.remainingGuess} left)` }}
        </span>
      </div>
      <div class="flex gap-4 text-xs text-zinc-500">
        <span class="text-red-400">{{ redRemaining }} red</span>
        <span class="text-blue-400">{{ blueRemaining }} blue</span>
      </div>
    </div>
    <div
      v-if="game.status !== 'playing'"
      class="w-full text-center py-3 rounded font-bold text-lg tracking-wide"
      :class="game.status === 'red_wins' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'"
    >
      {{ game.status === 'red_wins' ? 'RED' : 'BLUE' }} TEAM WINS!
    </div>
    <div v-if="game.phase === 'clue' && game.status === 'playing'" class="flex items-end gap-3 w-full">
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
    <div v-if="game.phase === 'guess' && game.status === 'playing'" class="flex items-center gap-4 w-full">
      <div class="flex-1 bg-zinc-900 border border-zinc-700 rounded px-4 py-2 text-sm">
        Clue: <span class="font-bold text-white">{{ currentClue }}</span>
        &mdash; <span class="text-zinc-400">{{ game.remainingGuess }} guesses left</span>
      </div>
      <button
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
        :disabled="card.revealed || game.phase !== 'guess' || game.status !== 'playing'"
        class="aspect-[5/3] rounded flex items-center justify-center text-xs sm:text-sm font-semibold uppercase tracking-wide transition-all duration-200 border"
        :class="cardClass(card)"
      >
        {{ card.word }}
      </button>
    </div>
    <div class="flex items-center gap-2 text-xs text-zinc-500 select-none">
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="spymasterView" class="accent-zinc-500" />
        Spymaster view
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { CARD_TYPES, initGame, revealCard, setClue } from '../composables/game.js'

const game = reactive(initGame())
const spymasterView = ref(false)
const clueWord = ref('')
const clueNumber = ref(null)
const currentClue = ref('')

function newGame() {
  Object.assign(game, initGame())
  clueWord.value = ''
  clueNumber.value = null
  currentClue.value = ''
}

function submitClue() {
  if (!clueWord.value || !clueNumber.value) return;
  setClue(game, clueNumber.value)
  currentClue.value = `${clueWord.value} (${clueNumber.value})`
  clueWord.value = ''
  clueNumber.value = null
}

function guess(index) {
  revealCard(game, index)
}

function endTurn() {
  game.currentTeam = game.currentTeam === CARD_TYPES.RED ? CARD_TYPES.BLUE : CARD_TYPES.RED
  game.remainingGuess = 0
  game.phase = 'clue'
}

const redRemaining = computed(() =>
  game.board.filter(c => c.type === CARD_TYPES.RED && !c.revealed).length
)
const blueRemaining = computed(() =>
  game.board.filter(c => c.type === CARD_TYPES.BLUE && !c.revealed).length
)

function cardClass(card) {
  if (card.revealed) {
    return {
      'bg-red-500/80 border-red-400 text-white': card.type === CARD_TYPES.RED,
      'bg-blue-500/80 border-blue-400 text-white': card.type === CARD_TYPES.BLUE,
      'bg-zinc-600/80 border-zinc-500 text-zinc-300': card.type === CARD_TYPES.NEUTRAL,
      'bg-zinc-950 border-zinc-400 text-zinc-300': card.type === CARD_TYPES.ASSASSIN,
    }
  }

  if (spymasterView.value) {
    return {
      'bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25': card.type === CARD_TYPES.RED,
      'bg-blue-500/15 border-blue-500/40 text-blue-300 hover:bg-blue-500/25': card.type === CARD_TYPES.BLUE,
      'bg-zinc-800/50 border-zinc-600/40 text-zinc-400 hover:bg-zinc-700/50': card.type === CARD_TYPES.NEUTRAL,
      'bg-zinc-950 border-zinc-500/40 text-zinc-400 hover:bg-zinc-800': card.type === CARD_TYPES.ASSASSIN,
    }
  }

  return 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:border-zinc-600 cursor-pointer disabled:cursor-default disabled:hover:bg-zinc-800 disabled:hover:border-zinc-700'
}
</script>
