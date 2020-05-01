# Base image
FROM node:12 AS base
WORKDIR /usr/motum/auth
ARG port
ARG envfile=.env

COPY package.json .

# Dependancies image
FROM base AS deps
COPY yarn.lock .
COPY ${envfile} .
COPY schema.prisma .
RUN yarn install --prod
RUN cp -R node_modules prod_node_modules
RUN yarn install

# Builder image
FROM deps AS build
COPY . .
RUN yarn build prod

# Production image
FROM base AS release
LABEL maintainer="Yaroslav Petryk"
LABEL description="Service for managing real-time user activity sessions"
LABEL version="0.1.0"

COPY .env.example .
COPY ${envfile} .
COPY --from=build /usr/motum/auth/out ./out
COPY --from=deps /usr/motum/auth/prod_node_modules ./node_modules

EXPOSE ${port}
CMD ["yarn", "start"]
