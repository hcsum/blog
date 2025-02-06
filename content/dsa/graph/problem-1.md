# Problem

- Write a function that takes in an array of flight objects, a fare limit, and a flight origin,
- return an array of flight destinations that with the fare not higher than the fare limit.
- Combined flights are allowed.

```typescript
type Flight = {
  origin: string;
  destination: string;
  fare: number;
};

function findFlights(
  flights: Flight[],
  limit: number,
  origin: string,
): string[] {
  // implement it
  const result = new Set<string>();

  function dfs(origin: string, limit: number) {
    for (const f of flights) {
      if (origin === f.origin) {
        const newLimit = limit - f.fare;
        if (newLimit < 0) continue;
        result.add(f.destination);
        dfs(f.destination, newLimit);
      }
    }
  }

  dfs(origin, limit);

  return Array.from(result);
}

// Example usage:
const flights: Flight[] = [
  { origin: "A", destination: "B", fare: 50 },
  { origin: "B", destination: "C", fare: 30 },
  { origin: "C", destination: "D", fare: 20 },
  { origin: "A", destination: "D", fare: 100 },
];

console.log(findFlights(flights, 100, "A")); // Output: ['B', 'C', 'D']
```
