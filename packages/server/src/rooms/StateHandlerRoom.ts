import { Room, Client } from 'colyseus';
import { TPlayerOptions } from '../entities/Player';
import { State, IState } from '../entities/State';

export class StateHandlerRoom extends Room<State> {
  maxClients = 1000;

  onCreate(options: IState) {
    this.setState(new State(options));

    this.onMessage(0, (client, _data) => {
      // add to queue for processing during tick consumption
    });
  }

  onAuth(_client: any, _options: any, _req: any) {
    return true;
  }

  onJoin(client: Client, options: TPlayerOptions) {
    console.log('joiner', options)
    this.state.createPlayer(client.sessionId, options);
  }

  onLeave(client: Client) {
    this.state.removePlayer(client.sessionId);
  }

  onDispose() {
    console.log('Dispose StateHandlerRoom');
  }
}
