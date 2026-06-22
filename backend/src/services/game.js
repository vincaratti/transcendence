import prisma from "./prisma.js";
import { WORDS } from "../assets/words.js";

const CARD_TYPES = { RED: "RED", BLUE: "BLUE", NEUTRAL: "NEUTRAL", ASSASSIN: "ASSASSIN" };
const PHASE_TYPES = { GUESS: "GUESS", CLUE: "CLUE" };
const GAME_STATUS = { WAITING: "WAITING", IN_PROGRESS: "IN_PROGRESS", FINISHED: "FINISHED" };

function generateCode() {
	return Math.random().toString(36).substring(2, 8).toUpperCase();
}

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
		status: GAME_STATUS.WAITING
	};
	return gameState;
}

async function createGame(userId) {
	const state = initGame();

	const game = await prisma.game.create({
		data: {
			code: generateCode(),
			status: state.status,
			currentTeam: state.currentTeam,
			phase: state.phase,
			remainingGuess: state.remainingGuess,
			board: state.board,
			players: {
				create: {
					userId,
					team: state.currentTeam,
					role: "SPYMASTER",
				},
			},
		},
		include: { players: true },
	})
	return game
}

async function startGame(game) {
	await prisma.game.update({
		where: { id: game.id },
		data: { status: GAME_STATUS.IN_PROGRESS },
	});
}

async function getGame(code) {
	return prisma.game.findUnique({
		where: { code },
		include: { players: { include: { user: { select: { username: true } } } } },
	});
}

async function joinGame(code, userId, team, role) {
	return prisma.player.create({
		data: {
			team,
			role,
			game: { connect: { code } },
			user: { connect: { id: userId } },
		},
		include: { user: { select: { username: true } } },
	});
}

function revealCard(game, index) {
	const board = game.board;

	if (index < 0 || board[index].revealed || game.status != GAME_STATUS.IN_PROGRESS || game.remainingGuess <= 0)
		return ;
	board[index].revealed = true;

	if (board[index].type == CARD_TYPES.ASSASSIN) {
		game.status = GAME_STATUS.FINISHED;
		game.winner = game.currentTeam === CARD_TYPES.RED ? CARD_TYPES.BLUE : CARD_TYPES.RED;
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
		game.status = GAME_STATUS.FINISHED;
		game.winner = game.currentTeam;
		return game;
	}

	game.remainingGuess --;
	if (!game.remainingGuess) {
		game = switchTurn(game);
	}
	return game;
}

function setClue(game, number) {
	if (number < 1 || game.status != GAME_STATUS.IN_PROGRESS || game.remainingGuess >= 1)
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

async function switchRole(code, userId, team, role) {
	const game = await prisma.game.findUnique({ where: { code } });
	if (!game) return null;
	return prisma.player.update({
		where: { userId_gameId: { userId, gameId: game.id } },
		data: { team, role },
		include: { user: { select: { username: true } } },
	});
}

async function leaveGame(code, userId) {
	const game = await prisma.game.findUnique({ where: { code } });
	if (!game) return null;
	return prisma.player.delete({
		where: { userId_gameId: { userId, gameId: game.id } },
	});
}

export { CARD_TYPES, GAME_STATUS, PHASE_TYPES, createGame, getGame, joinGame, leaveGame, revealCard, setClue, startGame, switchRole };
