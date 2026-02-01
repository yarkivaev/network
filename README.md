# Resource Network

Immutable graph library for network analysis.

## Install

```
npm install
```

## Test

```
npm test
```

## Core Objects

- **node(identifier)** - Creates a node with unique identifier
- **edge(source, target, weight, capacity)** - Creates a directed edge between nodes
- **network(nodes, edges)** - Creates an immutable network
- **mutation(network)** - Modifies networks: `add`, `remove`, `link`, `unlink`
- **scan(network)** - Queries networks: `has`, `neighbors`, `connection`, `isolated`

## Algorithm Objects

- **tree(network)** - Minimum spanning tree via `span()`
- **route(network, origin, destination)** - Shortest path via `shortest()`, `path()`, `cost()`, `exists()`
- **flow(network, source, sink)** - Maximum flow via `maximum()`, `bottlenecks()`
- **vulnerability(network)** - Critical elements via `bridges()`, `articulations()`, `critical()`, `fragments()`
