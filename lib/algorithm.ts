import type { Intersection, Road } from "./types"

// Implementation of Dijkstra's algorithm to find shortest path
export function findShortestPath(
  intersections: Intersection[],
  roads: Road[],
  startId: number,
  endId: number,
): number[] {
  // Create adjacency list representation of the graph
  const graph: Map<number, Map<number, number>> = new Map()

  // Initialize graph
  intersections.forEach((intersection) => {
    graph.set(intersection.id, new Map())
  })

  // Add roads to graph
  roads.forEach((road) => {
    const { startId, endId, length, bidirectional } = road

    // Get current weight or set to Infinity if not exists
    const startNode = graph.get(startId)!
    startNode.set(endId, length)

    // If road is bidirectional, add the reverse direction
    if (bidirectional) {
      const endNode = graph.get(endId)!
      endNode.set(startId, length)
    }
  })

  // Initialize distances and previous nodes
  const distances: Map<number, number> = new Map()
  const previous: Map<number, number | null> = new Map()
  const unvisited: Set<number> = new Set()

  // Set initial distances
  intersections.forEach((intersection) => {
    const id = intersection.id
    distances.set(id, id === startId ? 0 : Number.POSITIVE_INFINITY)
    previous.set(id, null)
    unvisited.add(id)
  })

  // Main Dijkstra algorithm
  while (unvisited.size > 0) {
    // Find the unvisited node with the smallest distance
    let current: number | null = null
    let smallestDistance = Number.POSITIVE_INFINITY

    unvisited.forEach((id) => {
      const distance = distances.get(id)!
      if (distance < smallestDistance) {
        smallestDistance = distance
        current = id
      }
    })

    // If we can't find a node or we've reached the end, break
    if (current === null || current === endId || smallestDistance === Number.POSITIVE_INFINITY) {
      break
    }

    // Remove current from unvisited
    unvisited.delete(current)

    // Check all neighbors of current
    const neighbors = graph.get(current)!
    neighbors.forEach((weight, neighborId) => {
      if (!unvisited.has(neighborId)) return

      const alt = distances.get(current!)! + weight

      // Check if this path is better
      if (alt < distances.get(neighborId)!) {
        distances.set(neighborId, alt)
        previous.set(neighborId, current)
      }
    })
  }

  // Reconstruct the path
  const path: number[] = []
  let current: number | null = endId

  // If there's no path to the end, return empty array
  if (previous.get(endId) === null && endId !== startId) {
    return []
  }

  // Build the path backwards
  while (current !== null && current !== startId) {
    path.unshift(current)
    current = previous.get(current)!
  }

  return path
}

// Function to optimize traffic lights for ambulance route
export function optimizeTrafficLightsForAmbulance(
  intersections: Intersection[],
  ambulancePath: number[],
): Intersection[] {
  // Create a deep copy to avoid mutating the original
  const newIntersections = JSON.parse(JSON.stringify(intersections))

  // Set all traffic lights to red first (default state)
  newIntersections.forEach((intersection: Intersection) => {
    if (intersection.trafficLight) {
      intersection.trafficLight.state = "red"
    }
  })

  // Set traffic lights along the ambulance path to green
  ambulancePath.forEach((intersectionId) => {
    const intersection = newIntersections.find((i: Intersection) => i.id === intersectionId)
    if (intersection && intersection.trafficLight) {
      intersection.trafficLight.state = "green"
      intersection.trafficLight.timer = 0 // Reset timer
    }
  })

  return newIntersections
}
