import { io } from 'socket.io-client'
import { getAuthToken } from '../components/utils.js'

let socket = null;

export function getSocket() {
	if (!socket) {
		socket = io({ path: '/ws/', auth: { token: getAuthToken() } });
	}
	return socket;
}
