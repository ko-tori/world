import { Schema, type } from '@colyseus/schema';

export type TPlayerOptions = Pick<Player, 'sessionId' | 'userId' | 'name' | 'avatarUri' | 'x' | 'y' | 'speed'>;

export class Player extends Schema {
  @type('string')
  public sessionId: string;

  @type('string')
  public userId: string;

  @type('string')
  public avatarUri: string;

  @type('string')
  public name: string;

  @type('number')
  public x: number;

  @type('number')
  public y: number;

  @type('number')
  public speed: number;

  constructor({ name, userId, avatarUri, sessionId, x, y, speed }: TPlayerOptions) {
    super();
    this.userId = userId;
    this.avatarUri = avatarUri;
    this.name = name;
    this.sessionId = sessionId;
    this.x = x;
    this.y = y;
    this.speed = speed;
  }
}
