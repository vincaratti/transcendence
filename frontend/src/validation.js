export const USERNAME_MIN = 3
export const USERNAME_MAX = 20
export const PASSWORD_MIN = 8
export const PASSWORD_MAX = 72
export const EMAIL_MAX = 254

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/

export function usernameError(input) {
	const value = (input ?? '').trim()
	if (!value) return 'Username is required'
	if (value.length < USERNAME_MIN || value.length > USERNAME_MAX)
		return `Username must be between ${USERNAME_MIN} and ${USERNAME_MAX} characters`
	if (!USERNAME_PATTERN.test(value))
		return 'Username may only contain letters, numbers, underscores and hyphens'
	return null
}

export function emailError(input) {
	const value = (input ?? '').trim()
	if (!value) return 'Email is required'
	if (value.length > EMAIL_MAX) return 'Email is too long'
	if (!EMAIL_PATTERN.test(value)) return 'Please enter a valid email address'
	return null
}

export function newPasswordError(input) {
	const value = input ?? ''
	if (!value) return 'Password is required'
	if (value.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`
	if (value.length > PASSWORD_MAX) return `Password must be at most ${PASSWORD_MAX} characters`
	if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value))
		return 'Password must contain at least one letter and one number'
	return null
}
