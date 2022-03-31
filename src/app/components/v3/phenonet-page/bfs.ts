export function loadGraphAsAdjacencyList(
  graph: {
    nodes: string[],
    edges: {
      from: string,
      to: string,
      value: number
    }[]
  }): Map<string, {
  to: string,
  value: number
}[]> {

  const adjacencyList = new Map<string, {
    to: string,
    value: number
  }[]>();

  function addNode(disease: string): void {
    adjacencyList.set(disease, []);
  }

  function addEdge({from, to, value}: { from: string, to: string, value: number }): void {
    adjacencyList.get(from).push({to, value});
    adjacencyList.get(to).push({to: from, value});
  }

  const {nodes, edges} = graph;

  nodes.forEach(addNode);
  edges.forEach(addEdge);

  return (adjacencyList);
}

export function bfsAsync(adjacencyList: Map<string, any>, start: string, depth: number, valueLimit: number): Promise<Set<string>[]>{

  return new Promise<Set<string>[]>((resolve, reject) => {
    if (typeof start === 'undefined' || typeof depth === 'undefined') {
      reject('Undefined Values');
    }
    if (!start || !depth) {
      reject('Undefined Values');
    }
    if (!adjacencyList.get(start)) {
      reject('Unknown Disease Name');
    }


    const arrayOfSets = bfs4(adjacencyList, start, depth, Array(depth + 1).fill(new Set()), 0, valueLimit);
    resolve(arrayOfSets);
  });

}

function bfs4(
  adjacencyList: Map<string, any>,
  start: string,
  depth: number,
  visited: Set<string>[] = [],
  k = 0,
  limit: number): Set<string>[] {
  if (k === depth) {
    return [];
  }
  if (!visited[depth].has(start)) {
    visited[depth].add(start);
  }
  const destinations = adjacencyList.get(start).filter(edge => edge.value >= limit).map((edge: any) => edge.to);
  destinations.forEach((dest: any) => {
    if (!visited[depth].has(dest)) {
      visited[k].add(dest);
    }
    visited[depth].add(dest);
  });
  for (const dest of destinations) {
    bfs4(adjacencyList, dest, depth, visited, k + 1, limit);
  }
  return visited;
}


// const arrayOfSets = await bfsAsync(graph, q, d as number);
// nodesSet = arrayOfSets[arrayOfSets.length - 1]
