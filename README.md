## Description

Determines which popular words are still available as band names.

This was a personal test for using Cursor IDE to create a project in a framework I don't have much experience with.
It's missing a bunch of stuff:

- unit tests
- end-to-end tests
- manual testing of production deployment
- a thought-through REST API
- any sort of user interface

## Project setup

This project requires pnpm to be installed.

```bash
# install dependencies
$ pnpm install

# set up .env
$ cp .env.example .env
$ nano -w .env
```

## Start the web and database servers
See also [CONTRIBUTING.MD](./CONTRIBUTING.md).

Right now, there is a bug in the Dockerfile that prevents the NestJS CLI from resolving,
so we'll run it locally.

```bash
# development / watch mode
$ docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up
$ pnpm run start:dev
```

## Generate band names

* [Download and ingest dataset](http://localhost:3000/most-frequent-words?limit=500)
* [Generate 20 names](http://localhost:3000/potential-band-names?limit=20)

You can look at the database tables for saved potential names / found Spotify bands.

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
