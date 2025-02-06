# WeakMap and WeakSet

[A good explanation of weakmap use case](https://www.youtube.com/watch?v=bLmHYji0Bxw)

WeakMap only has these instance methods:

```
WeakMap.prototype.delete()
WeakMap.prototype.get()
WeakMap.prototype.has()
WeakMap.prototype.set()
```

A weakmap can't tell how big it is, and can't keep order of keys like Object.

- Map/WeakMap/Object all can use object as key
- WeakMap can **only** use object as key
- WeakMap use weak reference, so the key will be garbage collected if the object is no longer in use. This can help prevent memory leak.
