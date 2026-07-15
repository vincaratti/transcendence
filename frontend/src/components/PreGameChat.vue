// this one is tricky and i should focus
//  on the chat before the game and settings because idk how to communciate with godot
// altho for chat i need to comunicate with server

/*
GET    /api/friends                    -> 200 { friends: [{ id, username, avatarUrl, status, online }] }
POST   /api/friends/requests           body: { toUserId }       -> 201 { request }
PATCH  /api/friends/requests/:id       body: { action: "accept"|"decline" } -> 200 { friendship }
DELETE /api/friends/:userId            -> 204
POST   /api/blocks                     body: { userId }         -> 201
DELETE /api/blocks/:userId             -> 204
*/

-- messages (DM if recipient_id set, else lobby/global channel)
messages(
  id            uuid PRIMARY KEY,
  sender_id     uuid NOT NULL REFERENCES users(id),
  recipient_id  uuid REFERENCES users(id),  -- null = global lobby
  content       text NOT NULL,
  read_at       timestamptz,                -- for read receipts (advanced chat)
  created_at    timestamptz NOT NULL DEFAULT now()
)



<template>
  <div class="chatcontainer">

    <div class="friends-list">
      <div
        v-for="friend in friends"
        :key="friend.id"
        class="friend"
      >
        {{ friend.username }}
      </div>
    </div>

    <div class="chatbox">
      <p>Chat box coming soon</p>
    </div>

  </div>
</template>
<script setup>
    import {ref, onMounted }from 'vue'
    import { apiFetch } from './utils.js'
    const props = defineProps({
            user: Object,
            token: String
    })
    const friends = ref([]) // because of the loop
    
      async function getFriends() {
        const response = await apiFetch('/friends')

        const data = await response.json()
        if (response.status === 200)
        {
            friends.value = data.friends
        }

    /* pseudocode

        connect to chat server with username
        concurrently
            on message received:
                add message to chatbox
            on send button click or enter key pressed:
                send message to chat server
        but also retriver friend list and build friends
        maybe use for loop to show idk
    
    */
    
    // connect to chat server with username
    }
    if (!user || !token)
    {
        //console.log('THIS SHOULDNT HAPPEN SOMETHING WENT VERY WRONG')
        //emit
    }
      onMounted(() => {
        getFriends()
      })
</script>


<style scoped> 
.friends-list {
  height: 300px;      /* fixed height */
  overflow-y: auto;   /* vertical scrollbar when needed */
  border: 1px solid #ccc;
}

.friend {
  padding: 8px;
  border-bottom: 1px solid #eee;
}

</style>
