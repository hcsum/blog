# Quadratic vs exponential vs factorials

## Quadratic Complexity - O(n²)

Quadratic complexity means that the runtime grows proportionally to the square of the input size. For example:

- If n = 10, operations ≈ 100
- If n = 100, operations ≈ 10,000
- If n = 1000, operations ≈ 1,000,000

Common examples of O(n²) algorithms:

- Nested loops iterating over an array
- Bubble sort
- Selection sort
- Insertion sort

## Exponential Complexity - O(2ⁿ)

Exponential complexity means the runtime doubles with each additional input element. For example:

- If n = 10, operations ≈ 1,024
- If n = 20, operations ≈ 1,048,576
- If n = 30, operations ≈ 1,073,741,824

Common examples of O(2ⁿ) algorithms:

- Recursive calculation of Fibonacci numbers
- Brute force solutions to the traveling salesman problem
- Finding all subsets of a set

## Factorial Complexity - O(n!)

Factorial complexity means the runtime grows according to the factorial of the input size. For example:

- If n = 5, operations ≈ 120
- If n = 10, operations ≈ 3,628,800
- If n = 15, operations ≈ 1,307,674,368,000 😨

Common examples of O(n!) algorithms:

- Generating all possible permutations of n items
- Brute force solution to the traveling salesman problem (checking every possible route)
- Solving certain combinatorial problems exhaustively

## Comparison

To understand how dramatically different these complexities are, consider this:

- At n = 5:
  - O(n²) performs 25 operations
  - O(2ⁿ) performs 32 operations
  - O(n!) performs 120 operations
- At n = 10:
  - O(n²) performs 100 operations
  - O(2ⁿ) performs 1,024 operations
  - O(n!) performs 3,628,800 operations
- At n = 15:
  - O(n²) performs 225 operations
  - O(2ⁿ) performs 32,768 operations
  - O(n!) performs over 1.3 trillion operations

## Practical Implications

- O(n²) algorithms can be practical for small to medium-sized inputs
- O(2ⁿ) algorithms are typically only practical for very small inputs (usually n < 20)
- O(n!) algorithms are only practical for extremely small inputs (usually n < 10)
- When possible, factorial algorithms should be avoided in favor of more efficient alternatives
- The growth rate from fastest to slowest is: O(n²) < O(2ⁿ) < O(n!)
