import { WORDS } from "../assets/words.js";

const CARD_TYPES = { RED: "RED", BLUE: "BLUE", NEUTRAL: "NEUTRAL", ASSASSIN: "ASSASSIN" };
const PHASE_TYPES = { GUESS: "guess", CLUE: "clue" };
const GAME_STATUS = { PLAYING: "playing", RED_WINS: "red_wins", BLUE_WINS: "blue_wins" };

function shuffle(array) {
	const deck = [...array];
	for (let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}
	return deck;
}

function initGame(startingTeam = CARD_TYPES.RED) {
	const words = shuffle(WORDS).slice(0, 25);

	const first = startingTeam;
	const second = first === CARD_TYPES.RED ? CARD_TYPES.BLUE : CARD_TYPES.RED;

	const types = shuffle([
		...Array(9).fill(first),
		...Array(8).fill(second),
		...Array(7).fill(CARD_TYPES.NEUTRAL),
		CARD_TYPES.ASSASSIN,
	]);

	const board = words.map((word, i) => ({
		word,
		type: types[i],
		revealed: false,
	}));

	const gameState = {
		board,
		currentTeam: first,
		phase: PHASE_TYPES.CLUE,
		remainingGuess: 0,
		status: GAME_STATUS.PLAYING
	};
	return gameState;
}

function revealCard(game, index) {
	const board = game.board;

	if (index < 0 || board[index].revealed || game.status != GAME_STATUS.PLAYING || game.remainingGuess <= 0)
		return ;
	board[index].revealed = true;

	if (board[index].type == CARD_TYPES.ASSASSIN) {
		game.status = game.currentTeam === CARD_TYPES.RED ? GAME_STATUS.BLUE_WINS : GAME_STATUS.RED_WINS;
		return game;
	}
	else if (board[index].type != game.currentTeam) {
		game = switchTurn(game);
		return game;
	}

	let foundUnrevealed = false;
	for (const card of board) {
		if (card.type == game.currentTeam && !card.revealed) {
			foundUnrevealed = true;
			break ;
		}
	}
	if (!foundUnrevealed) {
		game.status = game.currentTeam === CARD_TYPES.RED ? GAME_STATUS.RED_WINS : GAME_STATUS.BLUE_WINS;
		return game;
	}

	game.remainingGuess --;
	if (!game.remainingGuess) {
		game = switchTurn(game);
	}
	return game;
}

function setClue(game, number) {
	if (number < 1 || game.status != GAME_STATUS.PLAYING || game.remainingGuess >= 1)
		return ;
	game.remainingGuess = number + 1;
	game.phase = PHASE_TYPES.GUESS;
	return game;
}

function switchTurn(game) {
	game.currentTeam = game.currentTeam === CARD_TYPES.RED ? CARD_TYPES.BLUE : CARD_TYPES.RED;
	game.remainingGuess = 0;
	game.phase = PHASE_TYPES.CLUE;
	return game;
}

export { CARD_TYPES, initGame, revealCard, setClue };
