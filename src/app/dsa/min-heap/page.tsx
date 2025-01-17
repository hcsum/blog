export default function MinHeapExplanation() {
  return (
    <div className="p-6 bg-gray-50 text-gray-800 font-sans">
      <h1 className="text-2xl font-bold mb-4">MinHeap</h1>
      <p className="mb-4">
        A <strong>min-heap</strong> is a binary tree where each node is less than or equal to its children.
      </p>
      <p className="mb-4">
        The root of the tree is the smallest element in the heap.
      </p>

      <div className="bg-gray-100 p-4 rounded-md shadow-md mb-6">
        <pre className="text-sm font-mono">
          {`
        10
      /    \\
    15      20
   /  \\
 17    25`}
        </pre>
      </div>

      <div className="bg-gray-800 text-white p-4 rounded-md shadow-md mb-6">
        <pre className="text-sm font-mono">
          {`class MinHeap {
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
`}
        </pre>
      </div>

      <h2 className="text-xl font-semibold mb-4">Heapify Down - Mental Model: &quot;Push the Node Down&quot;</h2>
      <p className="mb-4">
        Imagine a node sinking down the tree like a bubble, always moving to the
        smaller of its children. This ensures that the smallest elements &quot;float
        to the top&quot; of the heap.
      </p>
      <ul className="list-disc list-inside mb-6">
        <li>Start with the current node at index <code>i</code> (initially the root, 0).</li>
        <li>
          Compare the node with its left and right children:
          <ul className="list-disc list-inside ml-4">
            <li>If both children exist, find the smaller one.</li>
            <li>If only one child exists (left child), compare with it.</li>
          </ul>
        </li>
        <li>
          If the current node is larger than the smaller child, swap them.
        </li>
        <li>Update the index to the swapped child&apos;s position and repeat.</li>
      </ul>

      <h2 className="text-xl font-semibold mb-4">Real-world Problem</h2>

      <h3 className="text-lg font-semibold mb-2">Part 1: Static File</h3>
      <p className="mb-4">
        You are given a static log file containing billions of entries. Each
        entry contains a timestamp and the name of a food order. The entries in
        the log file appear in order of increasing timestamp. Design a method
        <code>getCommon(k)</code> to determine the <code>k</code> most common food
        orders found in the log file.
      </p>
      <div className="bg-gray-100 p-4 rounded-md shadow-md mb-6">
        <pre className="text-sm font-mono">
          {`
1595268625,Hamburger
1595268626,Salad
1595268627,HotDog
1595268628,Hamburger
1595268629,HotDog
1595268630,HotDog
...
          `}
        </pre>
      </div>

      <h3 className="text-lg font-semibold mb-2">Part 2: Streaming</h3>
      <p className="mb-4">
        We now want to analyze food orders in a real-time streaming application.
        All food orders may not have been received at the time the top
        <code>k</code> most common ones need to be computed. Given the addition of
        this requirement, how would you handle processing incoming food orders
        and computing the top <code>k</code>?
      </p>
      <p className="mb-4">
        Your solution should have two functions: <code>ingestOrder(order)</code>
        and <code>getCommon(k)</code>. Expect the number of function calls to
        <code>ingestOrder(order)</code> and <code>getCommon(k)</code> to be roughly
        equal.
      </p>
    </div>
  );
}
