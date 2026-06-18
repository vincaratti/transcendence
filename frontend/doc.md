
# impersonal doc
https://www.youtube.com/watch?v=VeNfHj6MhgA // 3hours of vue from scratch
https://test-utils.vuejs.org/guide // test doc, quite direct and practical

# practical doc

>package.json

# COPY package*.json ./
# RUN npm install

>docker and testing
docker build -t frontend .
docker run -p 5173:5173 frontend
docker run -p 5173:5173 -v $(pwd):/app frontend 

// personal doc


# VITE :
tool to make developement easier
!!! since i have vite  we need .env variables to start by VITE_ if they4re to be used in the frontend
# VUE :
    MOUNTS
mounts describe how components are intialised, onMount is like constructor in object oriented programming


    interpolation {{}}
works only in template
uses JS scope from <script>

    Events can be created through @ syntax
useful events :
    @click
    if you need to await or fetch inside a function you NEED to declare it as async
    during tests you might need to use await nextTick() for the sake of DOM s next update
    Imports
imports seem to function very much like python as far as i can tell so far
 they must be inside scripts

    ref and react
are values that can update the ui whenever they4re updated automatically
ref() is for primitives while react() is for objects


    EXPORT default vs script setup
export default is older version more concrete and explicit and structured while script setup is more personal and abstract it being newer can also matter in some edge cases