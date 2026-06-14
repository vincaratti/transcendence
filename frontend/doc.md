
# impersonal doc
https://www.youtube.com/watch?v=VeNfHj6MhgA // 3hours of vue from scratch



# practical doc

>package.json
# is in the root of the frontend directory
# it can be used by docker to install dependencies
# todo make docker install those dependencies
# in this endeavor those scripts are necessary (npm run dev, npm run build, etc.)

# COPY package*.json ./
# RUN npm install

>docker and testing
docker build -t frontend .
docker run -p 5173:5173 frontend
docker run -p 5173:5173 -v $(pwd):/app frontend 

// personal doc

    MOUNTS
mounts describe how components are intialised, onMount is like constructor in object oriented programming



    interpolation {{}}
works only in template
uses JS scope from <script>

    Events can be created through @ syntax
useful events :
    @click
    Imports
imports seem to function very much like python as far as i can tell so far
 they must be inside scripts

    refs and reactive
    are values that can update the ui whenever they4re updated automatically     


    EXPORT default vs script setup
export default is older version more concrete and explicit and structured while script setup is more personal and abstract it being newer can also matter in some edge cases