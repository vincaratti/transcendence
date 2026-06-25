import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

export function showToast(text, { type = 'success', duration = 3000 } = {}) {
	const id = ++nextId
	toasts.value.push({ id, text, type })
	setTimeout(() => dismissToast(id), duration)
	return id
}

export function dismissToast(id) {
	toasts.value = toasts.value.filter((t) => t.id !== id)
}

export function useToasts() {
	return { toasts, showToast, dismissToast }
}
