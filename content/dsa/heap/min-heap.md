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

Since it is always a full tree, it is usually presented as an array.

```
[10, 15, 20, 17, 25]
```

## How to easily get parent/children given any index

- Left child: `2 * parent + 1`
- Right child: `2 * parent + 2`
- Parent: `Math.floor((index - 1) / 2)`

The reason given either the left child index or right child index can find parent is due to the property of integer division and rounding down. the 0.5 extra produced by the right child index is rounded down to 0.

## Implementation

```typescript
class MinHeap {
  private heap: number[];

  constructor(private capacity: number) {
    this.heap = [];
  }

  private getParentIndex(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private getLeftChildIndex(index: number): number {
    return 2 * index + 1;
  }

  private getRightChildIndex(index: number): number {
    return 2 * index + 2;
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

  extract(): number | undefined {
    if (this.heap.length === 0) return undefined;
    const root = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0] = last;
      this.heapifyDown();
    }
    return root;
  }

  front(): number | undefined {
    return this.heap.length > 0 ? this.heap[0] : undefined;
  }

  size(): number {
    return this.heap.length;
  }

  private heapifyUp(): void {
    let index = this.heap.length - 1;
    while (index > 0) {
      const parentIndex = this.getParentIndex(index);
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
      const leftChild = this.getLeftChildIndex(index);
      const rightChild = this.getRightChildIndex(index);
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
4. Update the index to the swapped child's position and repeat.

### Stop if:

- The node is smaller than both children.
- It reaches a leaf (no children).

### When calculating child indices, ensure they don't exceed the size of the heap:

```
Left child exists if 2 * index + 1 < heap.length
Right child exists if 2 * index + 2 < heap.length
```

_The essence of `heapifyDown` is simple: Push the node down to its correct position by always swapping it with its smallest child._
