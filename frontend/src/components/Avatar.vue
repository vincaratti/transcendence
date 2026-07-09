<template>
	<img
		:src="src || defaultAvatar"
		:alt="alt || 'avatar'"
		@error="onError"
		class="rounded-full object-cover bg-zinc-700"
	/>
</template>

<script setup>
import { ref, watch } from 'vue'
import defaultAvatar from '@/assets/default-avatar.svg'

const props = defineProps({
	url: { type: String, default: null },
	alt: { type: String, default: '' },
})

const src = ref(props.url || defaultAvatar)

watch(
	() => props.url,
	(value) => {
		src.value = value || defaultAvatar
	}
)

function onError() {
	src.value = defaultAvatar
}
</script>
