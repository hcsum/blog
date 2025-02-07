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

  function backtrack(start: number, currentSubset: number[]) {
    console.log("start", start, "currentSubset", currentSubset);
    result.push([...currentSubset]); // important: create a copy of currentSubset instead of adding it directly

    for (let i = start; i < nums.length; i++) {
      currentSubset.push(nums[i]); // [1]
      backtrack(i + 1, currentSubset);
      currentSubset.pop(); // where backtracking happens. it undo the previous choice, allowing us to explore different combinations
    }
  }

  backtrack(0, []); // Start recursion
  return result;
}

console.log(subsets([1, 2, 3]));
```

### The Decision Tree

- Each level represents a decision: We either include or exclude an element.
- Backtracking removes elements before trying a new path.
- All possible subsets are explored without duplicates.

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

1. backtrack(0, [])
2. ├── backtrack(1, [1])
3. │ ├── backtrack(2, [1,2])
4. │ │ ├── backtrack(3, [1,2,3])
5. │ │ └── Returns to backtrack(2, [1,2])
6. │ ├── backtrack(3, [1,3])
7. │ └── Returns to backtrack(1, [1])
8. ├── backtrack(2, [2])
9. │ ├── backtrack(3, [2,3])
10. │ └── Returns to backtrack(2, [2])
11. ├── backtrack(3, [3])
12. └── Returns to backtrack(0, [])

### Paths

1st Path (Include Everything)

```
[]  → ✅ [1] → ✅ [1,2] → ✅ [1,2,3]  ✅ (added to result)
                        ⬆︎ backtrack (remove 3)
              → ❌ [1,2]  ✅ (added to result)
      ⬆︎ backtrack (remove 2)
      → ✅ [1,3]  ✅ (added to result)
      ⬆︎ backtrack (remove 3)
→ ❌ [1] ✅ (added to result)
⬆︎ backtrack (remove 1)
```

2nd Path (Start with 2)

```
[]  → ✅ [2] → ✅ [2,3]  ✅ (added to result)
               ⬆︎ backtrack (remove 3)
      → ❌ [2]  ✅ (added to result)
⬆︎ backtrack (remove 2)
```

3rd Path (Start with 3)

```
[]  → ✅ [3] ✅ (added to result)
⬆︎ backtrack (remove 3)
```
