# Backtracking 🤯

https://leetcode.com/problems/subsets/

Given an integer array nums of unique elements, return all possible
subsets
(the power set).

The solution set must not contain duplicate subsets. Return the solution in any order.

Example 1:

Input: nums = [1,2,3]
Output: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]

Example 2:

Input: nums = [0]
Output: [[],[0]]

## Solution

```typescript
function subsets(nums: number[]): number[][] {
  const result: number[][] = [];

  function dfs(start: number, currentSubset: number[]) {
    console.log("start", start, "currentSubset", currentSubset);
    result.push([...currentSubset]); // important: create a copy of currentSubset instead of adding it directly
    // console.log("result", result);

    for (let i = start; i < nums.length; i++) {
      currentSubset.push(nums[i]); // [1]
      dfs(i + 1, currentSubset);
      console.log("popped", currentSubset.pop(), currentSubset);
    }
  }

  dfs(0, []);
  return result;
}

console.log(subsets([1, 2, 3]));
```

### The Decision Tree

- Each level represents a decision: We either include or exclude an element.
- Backtracking removes elements before trying a new path.
- All possible subsets are explored without duplicates.

Backtracking is just DFS on tree except there's no pre-defined tree. You have to build your own tree by passing the states through parameters.

For example, normally when you do pre-order traversal, you go root -> root.left -> root.right. In backtracking involving choosing a number, left tree will be choosing the number and right tree not choosing. So you go left first by adding the number to path, call dfs(root.left). Pop it out of path (un-choosing) then dfs(root.right).

```
                         []
               ┌──────────┴──────────┐
             [1]                    []
       ┌──────┴──────┐          ┌──────┴──────┐
    [1,2]           [1]        [2]           []
   ┌────┴────┐    ┌──┴──┐    ┌──┴──┐       ┌──┴──┐
[1,2,3]   [1,2]  [1,3]  [1]  [2,3]  [2]   [3]   []
   ✅       ⬆︎     ✅     ⬆︎     ✅   ⬆︎     ✅    ✅
        Backtrack    Backtrack    Backtrack    (end)

```

### Call stacks

1. dfs(0, [])
2. ├── dfs(1, [1])
3. │ ├── dfs(2, [1,2])
4. │ │ ├── dfs(3, [1,2,3])
5. │ │ └── Returns to dfs(2, [1,2])
6. │ ├── dfs(3, [1,3])
7. │ └── Returns to dfs(1, [1])
8. ├── dfs(2, [2])
9. │ ├── dfs(3, [2,3])
10. │ └── Returns to dfs(2, [2])
11. ├── dfs(3, [3])
12. └── Returns to dfs(0, [])

### Paths

1st Path (Include Everything)

```
[]  → [1] → [1,2] → [1,2,3]  ✅ (added to result)
                   ⬆︎ backtrack (remove 3)
           → [1,2]  ✅ (added to result)
           ⬆︎ backtrack (remove 2)
     → [1,3]  ✅ (added to result)
     ⬆︎ backtrack (remove 3)
→ [1] ✅ (added to result)
⬆︎ backtrack (remove 1)
```

2nd Path (Start with 2)

```
[]  → [2] → [2,3]  ✅ (added to result)
           ⬆︎ backtrack (remove 3)
     → [2]  ✅ (added to result)
⬆︎ backtrack (remove 2)
```

3rd Path (Start with 3)

```
[]  → [3] ✅ (added to result)
⬆︎ backtrack (remove 3)
```
