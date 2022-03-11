# Intro

Programming task is to implement API get method to create a currency exchange API.

GET /quote, however it wasn't specified whether RESTFULL or old fashioned URL call with GET params should be implented/used.

So I've implemnted both ~~(keep in mind, that code was copy-pasted/duplicated, it's agains DRY/KISS principles, however it demonstrates basic knowledge)~~ (read updated section [## What's new (updated)](#whats-new-updated))

## What libs/frameworks/etc were used

For this task I've used (except standard express and related npm packages) the following:

- axios - lib for HTTP GET calls (as my current version of NODE is old and doesn't support native fetch method and node-fetch is pain in the a#$%)
- nodemon - to run the code and update it automatically (reload an app instead of manually doing it)
- mocha, chai - for testing (read updated section [## What's new (updated)](#whats-new-updated))
- For LRU I've used code, which I adpated for my needs from here: [https://stackoverflow.com/questions/996505/lru-cache-implementation-in-javascript](https://stackoverflow.com/questions/996505/lru-cache-implementation-in-javascript)

## How to run

**_npm install_** - install npm packages
**_npm run start_** - run API server
**_npm run test_** - run mocha script to run tests (API server should be runing)

## ~~What's missing~~ (read updated section [## What's new (updated)](#whats-new-updated))

~~There are some things that should be done:~~ (read updated section [## What's new (updated)](#whats-new-updated))

- ~~Move code from both /quote calls to a separate function, as it duplicates.~~ (read updated section [## What's new (updated)](#whats-new-updated))
- ~~Add more handling for statuses~~ (read updated section [## What's new (updated)](#whats-new-updated))
- ~~Add test framework, but it should be quite easy as the code is already written using typescript.~~ (read updated section [## What's new (updated)](#whats-new-updated))

## What's new (updated)

New changes to code:
1 Code was split into separate files (i.e. no more monolith) - fmethods, services, etc, for reusability in tests (i.e. avoid complexity - KISS 😎 )
2 Some more handling of statuses
3 Added mocha for testing
4 More async functions (i.e. avoid repeating/duplicate - DRY 😎 )
