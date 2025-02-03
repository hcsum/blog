# min heap vs max heap

MaxHeap is good for keeping track of the k _smallest_ items

MinHeap is good for keeping track of the k _largest_ items

Why?

Because the root of a heap is the most accessible one and can be easily popped off. So for example a MinHeap always keeping track of the **current** smallest one, if an incoming one is smaller, we ignore it, if bigger, we pop off the root, and add it to the heap. This keeps the heap to contain the k **largest** ones. And vice vesa for MaxHeap.

If we do it the other way around. For example use MaxHeap to keep track of the k largest items. We can't keep only the k items. We need to first insert **all** items into the heap, then pop k times to get to the result.
