<template>
	<div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
		<TransitionGroup name="toast">
			<div
				v-for="toast in toasts"
				:key="toast.id"
				role="status"
				class="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg"
				:class="
				toast.type === 'error'
					? 'border-red-500/40 bg-red-950/90 text-red-300'
					: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-300'
				"
			>
				<span>{{ toast.text }}</span>
				<button
					@click="dismissToast(toast.id)"
					class="ml-2 text-zinc-500 hover:text-zinc-300 transition-colors"
					aria-label="Dismiss"
				>
					&times;
				</button>
			</div>
		</TransitionGroup>
	</div>
</template>

<script setup>
import { useToasts } from '../composables/toast.js'

const { toasts, dismissToast } = useToasts()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
	transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
	opacity: 0;
	transform: translateX(1rem);
}
</style>
