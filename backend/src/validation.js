export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;
export const EMAIL_MAX = 254;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

export function checkUsername(input) {
	if (typeof input !== 'string') {
		return { error: 'Username is required' };
	}
	const value = input.trim();
	if (!value) {
		return { error: 'Username is required' };
	}
	if (value.length < USERNAME_MIN || value.length > USERNAME_MAX) {
		return { error: `Username must be between ${USERNAME_MIN} and ${USERNAME_MAX} characters` };
	}
	if (!USERNAME_PATTERN.test(value)) {
		return { error: 'Username may only contain letters, numbers, underscores and hyphens' };
	}
	return { value };
}

export function checkEmail(input) {
	if (typeof input !== 'string') {
		return { error: 'Email is required' };
	}
	const value = input.trim();
	if (!value) {
		return { error: 'Email is required' };
	}
	if (value.length > EMAIL_MAX) {
		return { error: 'Email is too long' };
	}
	if (!EMAIL_PATTERN.test(value)) {
		return { error: 'Please enter a valid email address' };
	}
	return { value };
}

export function checkNewPassword(input) {
	if (typeof input !== 'string' || !input) {
		return { error: 'Password is required' };
	}
	if (input.length < PASSWORD_MIN) {
		return { error: `Password must be at least ${PASSWORD_MIN} characters` };
	}
	if (input.length > PASSWORD_MAX) {
		return { error: `Password must be at most ${PASSWORD_MAX} characters` };
	}
	if (!/[a-zA-Z]/.test(input) || !/[0-9]/.test(input)) {
		return { error: 'Password must contain at least one letter and one number' };
	}
	return { value: input };
}

export function validateProfileUpdate(body = {}) {
	const data = {};

	for (const field of ['username', 'email', 'password']) {
		if (body[field] === undefined || body[field] === null) {
			continue;
		}
		const check =
			field === 'username' ? checkUsername(body[field])
				: field === 'email' ? checkEmail(body[field])
					: checkNewPassword(body[field]);

		if (check.error) {
			return { error: check.error };
		}
		data[field] = check.value;
	}

	if (!Object.keys(data).length) {
		return { error: 'Nothing to update' };
	}

	return { data };
}
