# WebSocket server for BattleShip game

RS School NodeJS 2023 Q2 - Week 4 Task

## Requirements

Use Node.js LTS version (at the time of writing 18.16.1)

## Installation

1. Clone/download this repository
2. `npm install`

## Provided scripts

- `npm run start` - start app in production mode
- `npm run start:dev` - start app in development mode with nodemon
- `npm run lint` - lint source files with ESLint
- `npm run prettier` - format source files & configs with Prettier

## Implementation details

- WebSocket server starts on port 3000. Web interface for the game is available on port 8181
- WebSocket server logs informational messages & info about problems to console
- Simple dumb bot for single player mode is also implemented
- If you shoot at an already open empty tile, the turn transition to other player will not occur
