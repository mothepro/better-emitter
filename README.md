# Fancy Emitter

> A new take on JavaScript's EventEmitter class. Makes use of types and the newest JS features.

This event emitter makes use of ES6 newset built in features, asynchronous functions and generators.

## Comparison against Node.js 'events' module

| | `fancy-emitter` | Node.js `events`
|-|-----------------|-----------------
| **Strongly Typed** | ☑ | ☒
| Asynchronous | ☑ | ☒
| Iterable | ☑ | ☒
| Cancellable Events | ☑ | ☒
| Magic Events | ☒ | ☑
| Memory Leaks | ☒ | ☑

## How to Use

Create a new emitter.

```typescript
import {SafeEmitter} from 'fancy-emitter'
const action = new SafeEmitter<number>()
```

Set a listener on the action.

```typescript
const value: number = await action.next
```

Or listen to many events which will occur.

```typescript
let total = 0
for await (const value of action)
  total += value
```

Then activate the emitter whenever you please `action.activate(12)`

Emitters and their listeners can also be cancelled.
To do this create an "unsafe" emitter instead.

```typescript
import {Emitter} from 'fancy-emitter'
const cancellableAction = new Emitter<number>()
```

The loop listeners may be gracefully broken out of

```typescript
cancellableAction.cancel()
```

or, with an error state by deactivating with the error

```typescript
cancellableAction.deactivate(Error('err'))
```

Emitters can be merged with the helper.

```typescript
import {SafeEmitter, Emitter, merge} from 'fancy-emitter'
const action = new SafeEmitter
const actionNumber = new Emitter<number>()

const merged = merge({ action, actionNumber })  // typeof merged == Emitter<
                                                // { name: "action" } |
                                                // { name: "actionNumber", value: number } >
```

Emitters can be cloned with the helper.

```typescript
import {SafeEmitter, clone} from 'fancy-emitter'
const original = new SafeEmitter<string>()
const cloned = clone(original) // typeof SafeEmitter<string>

cloned.once(str => console.log(`Hello ${str}`))
original.activate('world')
```

Emitters can be filtered with the helper.

```typescript
import {SafeEmitter, filter} from 'fancy-emitter'
const action = new SafeEmitter<string>()
const promise = filter(action, 'hello')

action.activate('hi')
action.activate('hey')
action.activate('hello') // promise is now resolved.
```

Emitters can be have listeners bound and later removed using the following helpers.

```typescript
import {onceCancellable, onCancellable} from 'fancy-emitter'
const action = new Emitter<number>()
const cancel = onCancellable(action, console.log)

action.activate(1)
action.activate(2)
cancel()
action.activate(3) // not console.log'd
```

### Classic

This can also be used like a classic event emitter with callbacks set to the `on` and `once` methods.

```typescript
const action = new SafeEmitter<string>()

action.on(data => console.log(data))

action.activate('hello')
action.activate('world')
```

These listeners provide more functionality in that they can be cancelled.

```typescript
const action = new Emitter<string>()

const cancel = action.onCancellable(data => console.log(data))
action.once(str => {
    if (str == 'world')
        cancel()
})

action.activate('hello')
action.activate('world')

action.activate('this will be shown')
setTimeout(() => action.activate("this won't. Since it occurs AFTER the cancel has time to propagate"))
```

Take a look at the tests for more examples.

## API

The emitter is the union between a few interfaces.

+ A Listener (or SafeListener), which only detects when an event occurred.

```typescript
interface Listener<T = void> extends AsyncIterable<T> {
    // Resolves when event is activated.
    // Rejects when event is deactivated or cancelled.
    readonly next: Promise<T>

    once(fn: OneArgFn<T>): Promise<void>
    on(fn: OneArgFn<T>): Promise<void>
}
```

+ A Broadcaster which can only trigger events.

```typescript
interface SafeBroadcaster<T = void> {
    // Argument can be omitted iff arg is void.
    activate(arg: T): this
}
```

+ Or an "unsafe" Brodcaster which can also trigger errors.

```typescript
interface Broadcaster<T = void> extends Broadcaster<T> {
    deactivate(err: Error): this
    cancel(): this
}
```

In the above interfaces the `OneArgFn` type refers to a function which takes an argument iff it isn't `void`.
It uses an optional argument if a union with void and another value is present.

```typescript
type OneArgFn<T> =
    Extract<T, void> extends never
        ? (arg: T) => void
        : Exclude<T, void> extends never
            ? () => void
            : (arg?: T) => void
```

## Roadmap

<details>

  <summary>Possibly, a handler for just deactivations</summary>

This would be a shorthand for the `fn` function here.

```typescript
try {
  for await (const _ of emitter);
} catch(err) {
  fn(err)
}
```

</details>

## CDN

Use the CDN from unpkg!

```html
<script src="//unpkg.com/fancy-emitter/dist/umd/index.js"></script>
<script>
  const {SafeEmitter} = emitter // The global variable `emitter` exposes the entire package.
</script>
```

Or as an ES module

```html
<script type="module" src="//unpkg.com/fancy-emitter/dist/esm/index.js"></script>
```
