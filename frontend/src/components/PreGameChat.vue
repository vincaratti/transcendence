// this one is tricky and i should focus
//  on the chat before the game and settings because idk how to communciate with godot
// altho for chat i need to comunicate with server


<template>
 <div class="chatcontainer">

    </div>
    <div class="friendlist">
        <p>Friend list coming soon</p>
        </div>
        <div class="chatbox">
        <p>Chat box coming soon</p>
    </div>

</template>
<script setup>
    const { username } = defineProps({
    username: String
    })
    if (username) {
    
    // connect to chat server with username
    }
    else 
    {
        console.log('THIS SHOULDNT HAPPEN SOMETHING WENT VERY WRONG')
    }

</script>


<style scoped>  </style>