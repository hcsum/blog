# DynamoDB

It is a key-value store like an object.

## Primary Index

It is a unique identifier for a item in a table. It is the "key" of the item.

It must contain a partition key and an optional sort key.

e.g.

Primary Key: `userId#timestamp`
Partition Key: `userId`
Sort Key: `timestamp`

(Not how data stored in DynamoDB, just a illustration)

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

1. It helps to gurantee uniqueness. Without it, we can't store same user's multiple actions. The new action of the same user will overwrite the old one (In the example above, since we use timestamp as the sort key, by a slim chance, two actions of the same user have the same timestamp, the new action will overwrite the old one).
2. It helps to sort data in the same partition.
3. It helps to query data in a specific range.

## Secondary Index

It is just like the primary key. It is used to query items by other attributes.

With each secondary key, DynamoDB will create an internal table.

e.g.

Secondary Index: `userId#action`
Partition Key: `userId`
Sort Key: `action`

(Not how data stored in DynamoDB, just a illustration, we can't have items with identical primary index, DynamoDB will handle this internally for us)

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

Notice the partition key of this secondary key is the same as the primary key. This is called a Local Secondary Key (LSI).

We can also create a Global Secondary Key (GSI).

e.g.

Secondary Index: `action#userId`
Partition Key: `action`
Sort Key: `userId`

This key enable us to query all the `purchase` actions, and sorted by `userId`.

So,

LSI, it shared the same partition key with the primary key.

GSI, it has a different partition key.

When querying with Secondary Index, we must provide the partition key.
