let authToken = localStorage.getItem('authToken')

export function setAuthToken(token) {
	authToken = token
	if (token) {
		localStorage.setItem('authToken', token)
	} else {
		localStorage.removeItem('authToken')
	}
}

export function getAuthToken() {
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
