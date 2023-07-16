import { Player } from './player.js';
import { BOT_PLAYER_ID } from './constants/index.js';

export class BotPlayer extends Player {
  constructor(gameId: number) {
    super('Bot', '', BOT_PLAYER_ID, null, gameId);
  }
}
