// here we initialise the app 
import {createApp} from 'vue'
import Transcendence from './Transcendence.vue'

createApp(Transcendence).mount('#test') // id of the div in index.html

// alternative syntax is to declare test as a variable then mount it 
// const test = document.getElementById('test')
// tradeoff is that the other syntax is easier to use for event handling
// perhaps we4ll revert to the other syntax if i can't figure out how to do event handling with the current syntax
// hereabove yapping









