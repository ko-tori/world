import { Schema, ArraySchema, type } from '@colyseus/schema';
import { Block } from './Block';

export class Chunk extends Schema {
    @type("number") x: number;
    @type("number") y: number;

    @type([Block]) blocks = new ArraySchema<Block>();

    constructor(x: number, y: number, blocks: string[]) {
        super();
        this.x = x;
        this.y = y;
        blocks.forEach(type => this.blocks.push(new Block(type)));
    }
}
