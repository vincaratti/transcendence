FROM node:22-alpine

# create working directory
WORKDIR /app

# copy dependency files first
COPY package*.json ./

# install dependencies
RUN npm install
# install testing dependencies for vitest and vue test utils and jsdom for testing in a node environment
RUN npm install -D vitest @vue/test-utils jsdom
# copy the rest of the frontend
COPY . .

# vite uses port 5173 by default
EXPOSE 5173

# self explanatory: start the dev server
# --host flag let access from outside the container
# we will merge with nginx docker later

# for now i am using this to test frontend and later with backend as well
CMD ["npm", "run", "dev", "--", "--host"]