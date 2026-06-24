let authToken = localStorage.getItem('authToken')

export function setAuthToken(token) {
	authToken = token
	if (token) {
		localStorage.setItem('authToken', token)
	} else {
		localStorage.removeItem('authToken')
	}
}

function decodeTokenPayload(token) {
	try {
		const payload = token.split('.')[1]
		const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
		return JSON.parse(json)
	} catch {
		return null
	}
}

export function isTokenExpired(token) {
	const payload = decodeTokenPayload(token)
	if (!payload || typeof payload.exp !== 'number') {
		return true
	}
	return Date.now() >= payload.exp * 1000
}

export function getAuthToken() {
	if (authToken && isTokenExpired(authToken)) {
		clearAuth()
	}
	return authToken
}

export function getStoredUser() {
	const raw = localStorage.getItem('user')
	return raw ? JSON.parse(raw) : null
}

export function setStoredUser(user) {
	if (user) {
		localStorage.setItem('user', JSON.stringify(user))
	} else {
		localStorage.removeItem('user')
	}
}

export function clearAuth() {
	setAuthToken(null)
	setStoredUser(null)
}

export async function apiFetch(path, options = {}) {
	return fetch(`/api${path}`, {
		...options,
		headers: {
			...(options.headers || {}),
			Authorization: `Bearer ${authToken}`,
		},
	})
}
