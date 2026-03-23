import { scan } from '../core/scan.js';

/**
 * Maximum flow finder using Ford-Fulkerson algorithm with BFS (Edmonds-Karp)
 */

/**
 * Finds the maximum flow in a network from source to sink using Edmonds-Karp algorithm
 * 
 * @param {Object} net - The network to flow through
 * @param {Object} source - The node where flow originates
 * @param {Object} sink - The node where flow terminates
 * @returns {Object} Object containing maximum flow value, bottlenecks, and edges with flow
 */
const maximumFlow = (net, source, sink) => {
  const edges = net.edges().items();
  
  const residualCapacity = new Map();
  const edgeMap = new Map(); // Map to get original edge from node pair
  const edgeMapByNode = new Map(); // Map to get original edge from node pair
  
  // Создаем остаточную сеть
  for (const edge of edges) {
    const sourceId = edge.source().identifier();
    const targetId = edge.target().identifier();
    const key = `${sourceId}->${targetId}`;
    const reverseKey = `${targetId}->${sourceId}`;
    
    edgeMap.set(key, edge);
    if (residualCapacity.has(key)) {
      residualCapacity.set(key, edge.capacity() + residualCapacity.get(key));
    } else {
      residualCapacity.set(key, edge.capacity());
      residualCapacity.set(reverseKey, 0);
    }

    if (!edgeMapByNode.has(sourceId)) { edgeMapByNode.set(sourceId, []); }
    edgeMapByNode.get(sourceId).push(edge);
    if (!edgeMapByNode.has(targetId)) { edgeMapByNode.set(targetId, []); }
    edgeMapByNode.get(targetId).push(edge);
  }
  
  let maxFlow = 0;
  // Ищем дополняющий путь
  const bfs = () => {
    const visited = new Set();
    const queue = [];
    const parent = new Map(); // для сохранения пути
    
    const sourceId = source.identifier();
    queue.push(sourceId);
    visited.add(sourceId);
    
    while (queue.length > 0) {
      const currentId = queue.shift();
        if (currentId === sink.identifier()) {
        // Reconstruct path and find bottleneck capacity
        const path = [];
        let node = sink.identifier();
        let pathFlow = Infinity;
        
        while (node !== sourceId) {
          const parentId = parent.get(node);
          const edgeKey = `${parentId}->${node}`;
          pathFlow = Math.min(pathFlow, residualCapacity.get(edgeKey) || 0);
          path.unshift({ from: parentId, to: node });
          node = parentId;
        }
        
        // Update residual capacities
        node = sink.identifier();
        while (node !== sourceId) {
          const parentId = parent.get(node);
          const forwardKey = `${parentId}->${node}`;
          const backwardKey = `${node}->${parentId}`;
          
          residualCapacity.set(forwardKey, (residualCapacity.get(forwardKey) || 0) - pathFlow);
          residualCapacity.set(backwardKey, (residualCapacity.get(backwardKey) || 0) + pathFlow);
          
          node = parentId;
        }
        
        maxFlow += pathFlow;
        return true;
      }
      
      for (const edge of edgeMapByNode.get(currentId) || []) {
        const tgtId = (edge.target().identifier() == currentId) ? edge.source().identifier() : edge.target().identifier();
        const srcId = currentId;
        
        const edgeKey = `${srcId}->${tgtId}`;
        const capacity = residualCapacity.get(edgeKey) || 0;
        if (capacity > 0 && !visited.has(tgtId)) {
            visited.add(tgtId);
            parent.set(tgtId, srcId);
            queue.push(tgtId);
        }
      }
    }
    
    return false;
  };
  
  while (bfs()) {}
  
  const edgesWithFlow = [];
  const bottlenecks = [];
  const flows = new Map();
  
  for (const edge of edges) {
    const sourceId = edge.source().identifier();
    const targetId = edge.target().identifier();
    const forwardKey = `${sourceId}->${targetId}`;
    
    // Flow is the original capacity minus residual capacity
    const originalCapacity = edge.capacity();
    const residual = residualCapacity.get(forwardKey) || 0;
    const flow = originalCapacity - residual;
    if (flow > 0) {
      flows.set(forwardKey, flow);
    }
    if (flow > 0) {
      edgesWithFlow.push(edge);
      
      // If flow equals capacity, it's a bottleneck
      if (flow === originalCapacity) {
        bottlenecks.push(edge);
      }
    }
  }
  console.log(flows);
  return {
    maximum: maxFlow,
    bottlenecks: bottlenecks,
    edges: edgesWithFlow,
    flows: flows
  };
};

/**
 * Creates a maximum.
 *
 * @param {Object} net - The network to flow through
 * @param {Object} source - The node where flow originates
 * @param {Object} sink - The node where flow terminates
 * @returns {Object} Flow object with maximum and bottlenecks methods
 * @throws {Error} When source equals sink
 * @throws {Error} When source or sink is not in network
 *
 * @example
 * const f = flow(net, sourceNode, sinkNode);
 * f.maximum(); // maximum flow value
 * f.bottlenecks(); // edges at capacity
 */
const flow = (net, source, sink) => {
  const scanner = scan(net);
  const sourceId = source.identifier();
  const sinkId = sink.identifier();
  if (sourceId === sinkId) {
    throw new Error('Source and sink cannot be the same node');
  }
  if (!scanner.has(source)) {
    throw new Error(`Source node does not exist: ${sourceId}`);
  }
  if (!scanner.has(sink)) {
    throw new Error(`Sink node does not exist: ${sinkId}`);
  }
  const maxFlow = maximumFlow(net, source, sink);
  return {
    /**
     * Returns the maximum possible flow rate.
     *
     * @returns {number} Maximum flow from source to sink
     */
    maximum: () => {
      return maxFlow.maximum;
    },
    /**
     * Returns edges that are at full capacity.
     *
     * @returns {Array} Array of saturated edges
     */
    bottlenecks: () => {
      return maxFlow.bottlenecks;
    },
    /**
     * Returns all edges carrying flow.
     *
     * @returns {Array} Array of edges with non-zero flow
     */
    edges: () => {
      return maxFlow.edges;
    },
    /**
     * Returns all flows.
     *
     * @returns {Array} Array of flows
     */
    flows: () => {
      return maxFlow.flows;
    }
  };
};

export { flow };
