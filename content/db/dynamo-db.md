---
title: "DynamoDB"
date: 2024-05-20
---

It is a key-value store like an object.

## Primary key

It is a unique identifier for an item in a table. It is the "key" of the item.

It consists of a partition key and an optional sort key.

e.g.

Primary Key: `userId#timestamp`
Partition Key: `userId`
Sort Key: `timestamp`

(Not how data is stored in DynamoDB, just an illustration)

```
{
  "123#1744341306266": {
    "userId": "123",
    "timestamp": "1744341306266",
    "action": "login"
  },
  "123#1744341306267": {
    "userId": "123",
    "timestamp": "1744341306267",
    "action": "purchase"
  }
}
```

### Why sort key matters?

1. It helps to guarantee uniqueness. Without it, we can't store multiple actions for the same user — a new action would overwrite the old one. (In the example above we use timestamp as the sort key, so on the slim chance that two actions of the same user share a timestamp, the new one still overwrites the old.)
2. It helps to sort data in the same partition.
3. It helps to query data in a specific range.

## Secondary Index

It is just like the primary key. It is used to query items by other attributes.

With each secondary index, DynamoDB will create an internal table.

e.g.

Secondary Index: `userId#action`
Partition Key: `userId`
Sort Key: `action`

(Not how data is stored in DynamoDB, just an illustration — we can't have items with an identical primary index; DynamoDB handles this internally for us)

```
{
  "123#login": {
    "userId": "123",
    "timestamp": "1744341306266",
    "action": "login"
  },
  "123#purchase": {
    "userId": "123",
    "timestamp": "1744341306267",
    "action": "purchase"
  },
  "123#purchase": {
    "userId": "123",
    "timestamp": "1744341306268",
    "action": "purchase"
  }
}
```

Now we can query all the `purchase` actions of user `123`.

Notice that the partition key of this secondary index is the same as the primary key's. This is called a Local Secondary Index (LSI).

We can also create a Global Secondary Index (GSI).

e.g.

Secondary Index: `action#userId`
Partition Key: `action`
Sort Key: `userId`

This index lets us query all the `purchase` actions, sorted by `userId`.

So:

An LSI shares the same partition key as the primary key.

A GSI has a different partition key.

When querying with a secondary index, we must provide the partition key.

Use GSIs by default. Use an LSI only when strong consistency is required.

## Read Consistency

### Strongly Consistent Reads

How it works: Returns the most up-to-date data, reflecting all writes that were acknowledged prior to the read.

Consistency: Guaranteed to return the latest committed value.

Performance & cost: Slightly slower, and uses more read capacity (twice as much per read as an eventually consistent read).

Use case: Required when you must guarantee up-to-date data, like in financial transactions, real-time bidding, or inventory systems where accuracy is critical.

### Eventually Consistent Reads

How it works: When you read data, the response might not reflect the results of a recently completed write operation (due to replication lag across regions or availability zones).

Consistency lag: Reads might return stale data for a very short period.

Performance & cost: Faster and cheaper — uses half the read capacity of a strongly consistent read.

Use case: Best for applications that can tolerate slightly outdated data—for example, dashboards, analytics, or social feeds.

### Global Tables
