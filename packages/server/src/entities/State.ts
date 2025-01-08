import { Schema, MapSchema, type, filter } from '@colyseus/schema';
import { TPlayerOptions, Player } from './Player';
import { Chunk } from './Chunk';
import { Client } from 'colyseus';

export interface IState {
  roomName: string;
  channelId: string;
}

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();

  @type('string')
  public roomName: string;

  @type('string')
  public channelId: string;

  @filter(function (
    this: State, client: Client, value: string, root: Schema
  ) {
    // TODO: only send nearby chunks to clients
    return true;
  })
  @type({ map: Chunk }) chunks = new MapSchema<Chunk>();

  constructor(attributes: IState) {
    super();
    this.roomName = attributes.roomName;
    this.channelId = attributes.channelId;
  }

  private _getPlayer(sessionId: string): Player | undefined {
    return Array.from(this.players.values()).find((p) => p.sessionId === sessionId);
  }

  createPlayer(sessionId: string, playerOptions: TPlayerOptions) {
    const existingPlayer = Array.from(this.players.values()).find((p) => p.userId === playerOptions.userId);
    if (existingPlayer == null) {
      this.players.set(playerOptions.userId, new Player({ ...playerOptions, sessionId }));
    }
  }

  removePlayer(sessionId: string) {
    const player = Array.from(this.players.values()).find((p) => p.sessionId === sessionId);
    if (player != null) {
      this.players.delete(player.userId);
    }
  }

  movePlayer(sessionId: string, data: any) {

  }
}
