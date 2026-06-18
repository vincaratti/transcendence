// this should have the wasm
// not sure how to do it maybe use javascript bridge to call godot wrapper or something
<template>
    <div class="singleGame">  

  <img v-if="loggingStatus" src="@/gifs/Loading_icon.gif" alt="Loading..." />
  <div v-else>Content loaded!</div> 
    </div>
    <p>Singleplayer coming soon</p> 

</template>
<script setup>
import { onMounted, ref } from 'vue';

const loggingStatus = ref(false)

function loadingGame() {

    loggingStatus = true
}

onMounted(() => {
    loadingGame()
})


</script>
<style scoped>

</style>