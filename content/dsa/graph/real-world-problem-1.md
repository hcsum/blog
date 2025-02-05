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
  const results: Set<string> = new Set();

  function search(
    currentOrigin: string,
    currentFare: number,
    visited: Set<string>,
  ) {
    for (const flight of flights) {
      if (flight.origin === currentOrigin) {
        const newFare = currentFare + flight.fare;

        if (newFare <= limit && !visited.has(flight.destination)) {
          results.add(flight.destination);
          const newVisited = new Set(visited);
          newVisited.add(flight.destination);
          search(flight.destination, newFare, newVisited);
        }
      }
    }
  }

  search(origin, 0, new Set());
  return Array.from(results);
}

// Example usage:
const flights: Flight[] = [
  { origin: "KKB", destination: "ABC", fare: 98 },
  { origin: "ABC", destination: "OKK", fare: 200 },
  { origin: "OKK", destination: "MLB", fare: 156 },
  { origin: "KKB", destination: "PRS", fare: 400 },
  { origin: "LPO", destination: "OKK", fare: 56 },
  { origin: "PRS", destination: "BIO", fare: 90 },
  { origin: "KKB", destination: "PPP", fare: 78 },
  { origin: "BIO", destination: "OKK", fare: 66.7 },
  { origin: "OKK", destination: "PPP", fare: 300.5 },
];

console.log(findFlights(flights, 500, "KKB"));
```
