import { Schema, type } from '@colyseus/schema';

export class Block extends Schema {
    @type('string')
    public blockType: string;

    constructor(blockType: string) {
        super();
        this.blockType = blockType;
    }
}
