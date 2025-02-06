# LRU caching

```typescript
class MyNode {
  key: number;
  value: number;
  prev: MyNode | null;
  next: MyNode | null;

  constructor(key: number, value: number) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  private capacity: number;
  private cache: Map<number, MyNode>;
  private head: MyNode; // Dummy head (most recently used)
  private tail: MyNode; // Dummy tail (least recently used)

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    this.head = new MyNode(0, 0); // Dummy head
    this.tail = new MyNode(0, 0); // Dummy tail
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  // Helper function to remove a node from the linked list
  private remove(node: MyNode): void {
    const prev = node.prev!;
    const next = node.next!;
    prev.next = next;
    next.prev = prev;
  }

  // Helper function to insert a node at the head (most recently used)
  private insert(node: MyNode): void {
    const next = this.head.next!; // old MRU
    this.head.next = node; // new MRU
    node.prev = this.head;
    node.next = next;
    next.prev = node;
  }

  // Get the value for a key
  get(key: number): number {
    if (this.cache.has(key)) {
      const node = this.cache.get(key)!;
      this.remove(node); // Remove from current position
      this.insert(node); // Move to head (most recently used)
      return node.value;
    }
    return -1; // Key not found
  }

  // Add or update a key-value pair
  put(key: number, value: number): void {
    if (this.cache.has(key)) {
      // If key exists, update its value and move it to the head
      const node = this.cache.get(key)!;
      node.value = value;
      this.remove(node);
      this.insert(node);
    } else {
      // If key doesn't exist, create a new node
      const newNode = new MyNode(key, value);
      this.cache.set(key, newNode);
      this.insert(newNode);

      // If cache exceeds capacity, remove the least recently used node
      if (this.cache.size > this.capacity) {
        const lruNode = this.tail.prev!; // MyNode before the dummy tail
        this.remove(lruNode); // Remove from the list
        this.cache.delete(lruNode.key); // Remove from the cache
      }
    }
  }
}

// Example usage:
const lruCache = new LRUCache(2);
lruCache.put(1, 1); // Cache is {1=1}
lruCache.put(2, 2); // Cache is {1=1, 2=2}
console.log(lruCache.get(1)); // Returns 1 (Cache is {2=2, 1=1})
lruCache.put(3, 3); // Evicts key 2, Cache is {1=1, 3=3}
console.log(lruCache.get(2)); // Returns -1 (not found)
lruCache.put(4, 4); // Evicts key 1, Cache is {3=3, 4=4}
console.log(lruCache.get(1)); // Returns -1 (not found)
console.log(lruCache.get(3)); // Returns 3 (Cache is {4=4, 3=3})
console.log(lruCache.get(4)); // Returns 4 (Cache is {3=3, 4=4})
```

## Why use dummy nodes head and tail?

- Use dummy node `this.head` and `this.tail` to reducee edge case when head or tail is null.
- Can easily retrieve MRU by `this.head.next` and LRU by `this.tail.prev`

## Mental model when moving around nodes in doubly linked list

```typescript
private remove(node: MyNode): void {
  const prev = node.prev!;
  const next = node.next!;
  prev.next = next;
  next.prev = prev;
}
```

1. Connect the prev and next of the target node
2. while the target node still linking its prev and next
3. Detach the target node from its prev and next
