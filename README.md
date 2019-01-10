# cycle-phoenix

A Cycle.js driver for handling channel connections with a Phoenix (Elixir) backend service.

It relies on the phoenix library not WS.

## Installation
```
npm install --save cycle-phoenix
```

Phoenix driver is initialised as a driver but connections are made on demand.

The reason behind this is to allow for front-end apps to make authorised connections after authentication (e.g. OAuth, Token based).

```typescript
import { makePhoenixWSDriver } from 'cycle-phoenix';
...

const drivers = {
    ...
    PhoenixPhoenixWS: makePhoenixWSDriver()
}

run(main, drivers);
```

## Usage
```typescript

// ./component.ts
import xs, { Stream, MemoryStream } from 'xstream';
import { DOMSource, VNode } from '@cycle/dom';
import { PhoenixWSSource } from 'cycle-phoenix';
import isolate from '@cycle/isolate';

interface Source {
    DOM: DOMSource
    PhoenixWS: PhoenixWSSource
}

interface Sink {
    DOM?: Stream<VNode>
    PhoenixWS?: Stream<any>
}

interface SomeWSMessage {

}
interface SomeWSModel {

}

// Component
function WSTest(sources: Source): Sink {
    // Intent
    function intent(sources: Source): MemoryStream<SomeWSMessage> {
        return sources.PhoenixWS
            .select('public_channel')
            .events('public_event')
            .startWith('initial');
    }

    // Model
    function model(stream$: MemoryStream<SomeWSMessage>) {
        return stream$.map(msg => {
            // ... model
            return msg;
        })
    }

    // View
    function view(state$: MemoryStream<SomeWSModel>): Stream<VNode> {
        return state$.map(m => {
            return h1(m);
        });
    }

    // WS
    function ws () {
        return xs.merge(
            // Ensure the socket is open
            xs.of({
                socket: {
                    name: 'ws_socket_1',
                    url: 'ws://localhost:4000/socket',
                    params: {
                        _token: sessionStorage.getItem('_token')
                    }
                }
            }),
            
            // Channel creation (private)
            xs.of({
                channel: {
                    socketId: 'ws_socket_1',
                    name: `private_channel`,
                    topic: 'some_private_topic',
                    params: {
                        _token: sessionStorage.getItem('_token')
                    }
                }
            }),

            // Channel creation (public)
            xs.of({
                channel: {
                    socketId: 'ws_socket_1',
                    name: `public_channel`,
                    topic: 'some_public_topic',
                    params: {
                        _token: sessionStorage.getItem('_token')
                    }
                }
            }),

            // Channel pusher
            xs.of({
                pusher: {
                    chanId: 'public_channel',
                    event: 'public_event',
                    payload: {
                        message: 'some_message_for_public_visibility'
                    }
                }
            })
        );
    }

    return {
        DOM: view(model(intent(sources))),
        PhoenixWS: ws()
    };
}

// Call from main app
export default function Component(sources: Source): Sink {
    const WSTest = isolate(WSTest, 'component_1')(sources);

    return {
        DOM: WSTest.DOM,
        PhoenixWS: WSTest.WS
    }
}

// ./app.ts
import { run } from '@cycle/run';
import { makeDOMDriver } from '@cycle/dom';
import { makePhoenixWSDriver } from 'cycle-phoenix';
import Component from './component';

// App
function main(sources) {
    return Component(sources);
}

const drivers = {
    DOM: makeDOMDriver(),
    PhoenixWS: makePhoenixWSDriver()
}

run(main, drivers);
```
