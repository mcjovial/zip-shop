FROM node:16

ENV PORT 8080

# Create app directory
RUN mkdir /var/movable/ && mkdir /var/movable/app
WORKDIR /var/movable/app

RUN rm -rf .next*
# Installing dependencies
COPY package*.json yarn.lock /var/movable/app/
RUN yarn

# Copying source files
COPY . /var/movable/app


# Building app
RUN yarn build
EXPOSE 8080

# Running the app
CMD "yarn" "start_prod"