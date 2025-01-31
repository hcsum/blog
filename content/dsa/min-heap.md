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

_The essence of `heapifyDown` is simple: Push the node down to its correct position by always swapping it with its smallest child._

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

#### Answer

```typescript
import * as fs from "fs";
import path from "path";
import * as readline from "readline";

interface FoodOrder {
  food: string;
  count: number;
}

class MinHeap {
  private heap: FoodOrder[];

  constructor(private capacity: number) {
    this.heap = [];
  }

  insert(order: FoodOrder): void {
    if (this.heap.length < this.capacity) {
      this.heap.push(order);
      this.heapifyUp();
    } else if (order.count > this.heap[0].count) {
      this.heap[0] = order;
      this.heapifyDown();
    }
    console.log("heap", this.heap);
  }

  extract(): FoodOrder | undefined {
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
      if (this.heap[parentIndex].count <= this.heap[index].count) break;
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
        this.heap[leftChild].count < this.heap[smallest].count
      ) {
        smallest = leftChild;
      }
      if (
        rightChild < this.heap.length &&
        this.heap[rightChild].count < this.heap[smallest].count
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

async function getCommon(filePath: string, k: number): Promise<string[]> {
  const foodCount: Map<string, number> = new Map();
  const heap = new MinHeap(k);

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream });

  // Count occurrences directly
  for await (const line of rl) {
    const [, food] = line.split(","); // Assuming log format: "timestamp,food"
    foodCount.set(food, (foodCount.get(food) || 0) + 1);
  }

  // Maintain top K in the heap
  for (const [food, count] of foodCount) {
    heap.insert({ food, count });
  }

  // Extract top K from the heap
  const result: string[] = [];
  while (heap.size() > 0) {
    result.push(heap.extract()!.food);
  }

  return result.reverse(); // Reverse to get descending order
}

// Usage example
(async () => {
  const k = 3;
  const topK = await getCommon(path.resolve(__dirname, "log.txt"), k);
  console.log("Top food orders:", topK);
})();
```

### Part 2: Streaming

We now want to analyze food orders in a real-time streaming application. All food orders may not have been received at the time the top `k` most common ones need to be computed. Given the addition of this requirement, how would you handle processing incoming food orders and computing the top `k`?

Your solution should have two functions: `ingestOrder(order)` and `getCommon(k)`. Expect the number of function calls to `ingestOrder(order)` and `getCommon(k)` to be roughly equal.

#### Answer

```typescript
type MenuItemType = "CATEGORY" | "DISH" | "OPTION";

interface MenuItem {
  id: number;
  type: MenuItemType;
  name: string;
  price?: number;
  linkedItems: number[];
}

class Category implements MenuItem {
  id: number;
  type: "CATEGORY";
  name: string;
  linkedItems: number[];

  constructor(id: number, name: string, linkedItems: number[]) {
    this.id = id;
    this.type = "CATEGORY";
    this.name = name;
    this.linkedItems = linkedItems;
  }
}

class Dish implements MenuItem {
  id: number;
  type: "DISH";
  name: string;
  price: number;
  linkedItems: number[];

  constructor(id: number, name: string, price: number, linkedItems: number[]) {
    this.id = id;
    this.type = "DISH";
    this.name = name;
    this.price = price;
    this.linkedItems = linkedItems;
  }
}

class OptionItem implements MenuItem {
  id: number;
  type: "OPTION";
  name: string;
  price: number;
  linkedItems: number[];

  constructor(id: number, name: string, price: number) {
    this.id = id;
    this.type = "OPTION";
    this.name = name;
    this.price = price;
    this.linkedItems = [];
  }
}

class Menu {
  items: MenuItem[];

  constructor() {
    this.items = [];
  }

  // Method to add a menu item
  addItem(item: MenuItem) {
    this.items.push(item);
  }

  // Method to reconstruct the menu stream from the object
  reconstructMenuStream(): string {
    return this.items
      .map((item) => {
        let base = `${item.id}\n${item.type}\n${item.name}`;
        if (item.type === "DISH" || item.type === "OPTION") {
          base += `\n${item.price?.toFixed(2)}`;
        }
        if (item.linkedItems.length > 0) {
          base += `\n${item.linkedItems.join("\n")}`;
        }
        return base;
      })
      .join("\n\n");
  }
}

function parseMenuStream(menuStream: string): Menu {
  const lines = menuStream.split("\n");
  const menu = new Menu();
  let i = 0;

  while (i < lines.length) {
    const id = parseInt(lines[i]);
    const type = lines[i + 1] as MenuItemType;
    const name = lines[i + 2];
    const linkedItems: number[] = [];
    let price: number | undefined;

    if (type === "DISH" || type === "OPTION") {
      price = parseFloat(lines[i + 3]);
      i += 4;
    } else {
      i += 3;
    }

    // Collect linked items
    while (i < lines.length && lines[i].trim() !== "") {
      linkedItems.push(parseInt(lines[i]));
      i++;
    }

    let menuItem: MenuItem;
    if (type === "CATEGORY") {
      menuItem = new Category(id, name, linkedItems);
    } else if (type === "DISH") {
      menuItem = new Dish(id, name, price!, linkedItems);
    } else {
      menuItem = new OptionItem(id, name, price!);
    }

    menu.addItem(menuItem);

    // Skip over the blank line between items
    i++;
  }

  return menu;
}

// Example usage:

const menuStream = `
4
DISH
Spaghetti
10.95
2
3

1
CATEGORY
Pasta
4
5

2
OPTION
Meatballs
1.00

3
OPTION
Chicken
2.00

5
DISH
Lasagna
12.00

6
DISH
Caesar Salad
9.75
3
`;

const myMenu = parseMenuStream(menuStream.trim());
console.log(myMenu.items);
console.log(myMenu.reconstructMenuStream());
```
