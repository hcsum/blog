# MinHeap

A **min-heap** is a binary tree where each node is less than or equal to its children.

The root of the tree is the smallest element in the heap.

```
      10
    /    \
   15      20
  /  \
 17    25
```

```typescript
class MinHeap {
  private heap: number[];

  constructor(private capacity: number) {
    this.heap = [];
  }

  insert(num: number): void {
    if (this.heap.length < this.capacity) {
      this.heap.push(num);
      this.heapifyUp();
    } else if (num > this.heap[0]) {
      this.heap[0] = num;
      this.heapifyDown();
    }
  }

  extractMin(): number | undefined {
    if (this.heap.length === 0) return undefined;
    const root = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.heapifyDown();
    }
    return root;
  }

  size(): number {
    return this.heap.length;
  }

  private heapifyUp(): void {
    let index = this.heap.length - 1;
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex] <= this.heap[index]) break;
      [this.heap[parentIndex], this.heap[index]] = [
        this.heap[index],
        this.heap[parentIndex],
      ];
      index = parentIndex;
    }
  }

  private heapifyDown(): void {
    let index = 0;
    while (index < this.heap.length) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (
        leftChild < this.heap.length &&
        this.heap[leftChild] < this.heap[smallest]
      ) {
        smallest = leftChild;
      }
      if (
        rightChild < this.heap.length &&
        this.heap[rightChild] < this.heap[smallest]
      ) {
        smallest = rightChild;
      }
      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[index],
      ];
      index = smallest;
    }
  }

  peek() {
    if (this.heap.length === 0) {
      throw new Error("Heap is empty");
    }
    return this.heap[0];
  }

  isEmpty() {
    return this.heap.length === 0;
  }
}
```

## Heapify Down - Mental Model: "Push the Node Down"

Imagine a node sinking down the tree like a bubble, always moving to the smaller of its children. This ensures that the smallest elements "float to the top" of the heap.

### Steps:

1. Start with the current node at index `i` (initially the root, 0).
2. Compare the node with its left and right children:
    - If both children exist, find the smaller one.
    - If only one child exists (left child), compare with it.
3. If the current node is larger than the smaller child, swap them.
4. Update the index to the swapped child’s position and repeat.

### Stop if:

- The node is smaller than both children.
- It reaches a leaf (no children).

### When calculating child indices, ensure they don’t exceed the size of the heap:

```
Left child exists if 2 * index + 1 < heap.length
Right child exists if 2 * index + 2 < heap.length
```

*The essence of `heapifyDown` is simple: Push the node down to its correct position by always swapping it with its smallest child.*

## Real-world Problem

### Part 1: Static File

You are given a static log file containing billions of entries. Each entry contains a timestamp and the name of a food order. The entries in the log file appear in order of increasing timestamp. Design a method `getCommon(k)` to determine the `k` most common food orders found in the log file.

```
1595268625,Hamburger
1595268626,Salad
1595268627,HotDog
1595268628,Hamburger
1595268629,HotDog
1595268630,HotDog
...
```

### Part 2: Streaming

We now want to analyze food orders in a real-time streaming application. All food orders may not have been received at the time the top `k` most common ones need to be computed. Given the addition of this requirement, how would you handle processing incoming food orders and computing the top `k`?

Your solution should have two functions: `ingestOrder(order)` and `getCommon(k)`. Expect the number of function calls to `ingestOrder(order)` and `getCommon(k)` to be roughly equal.

