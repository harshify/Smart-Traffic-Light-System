import type { TrafficState, Intersection, Road, Vehicle, TrafficLight } from "./types"
import { findShortestPath } from "./algorithm"

// Initialize traffic network
export function initializeTrafficState(): TrafficState {
  // Create intersections
  const intersections: Intersection[] = [
    {
      id: 0,
      x: 0.2,
      y: 0.2,
      trafficLight: createTrafficLight("red"),
    },
    {
      id: 1,
      x: 0.5,
      y: 0.2,
      trafficLight: createTrafficLight("green"),
    },
    {
      id: 2,
      x: 0.8,
      y: 0.2,
      trafficLight: createTrafficLight("red"),
    },
    {
      id: 3,
      x: 0.2,
      y: 0.5,
      trafficLight: createTrafficLight("red"),
    },
    {
      id: 4,
      x: 0.5,
      y: 0.5,
      trafficLight: createTrafficLight("green"),
    },
    {
      id: 5,
      x: 0.8,
      y: 0.5,
      trafficLight: createTrafficLight("red"),
    },
    {
      id: 6,
      x: 0.2,
      y: 0.8,
      trafficLight: createTrafficLight("green"),
    },
    {
      id: 7,
      x: 0.5,
      y: 0.8,
      trafficLight: createTrafficLight("red"),
    },
    {
      id: 8,
      x: 0.8,
      y: 0.8,
      trafficLight: createTrafficLight("green"),
    },
  ]

  // Create roads
  const roads: Road[] = [
    { id: 0, startId: 0, endId: 1, length: 1, bidirectional: true },
    { id: 1, startId: 1, endId: 2, length: 1, bidirectional: true },
    { id: 2, startId: 0, endId: 3, length: 1, bidirectional: true },
    { id: 3, startId: 1, endId: 4, length: 1, bidirectional: true },
    { id: 4, startId: 2, endId: 5, length: 1, bidirectional: true },
    { id: 5, startId: 3, endId: 4, length: 1, bidirectional: true },
    { id: 6, startId: 4, endId: 5, length: 1, bidirectional: true },
    { id: 7, startId: 3, endId: 6, length: 1, bidirectional: true },
    { id: 8, startId: 4, endId: 7, length: 1, bidirectional: true },
    { id: 9, startId: 5, endId: 8, length: 1, bidirectional: true },
    { id: 10, startId: 6, endId: 7, length: 1, bidirectional: true },
    { id: 11, startId: 7, endId: 8, length: 1, bidirectional: true },
  ]

  // Create some regular vehicles
  const vehicles: Vehicle[] = [
    {
      id: 1,
      type: "car",
      position: 0,
      destination: 8,
      path: [1, 4, 7],
      progress: 0.3,
    },
    {
      id: 2,
      type: "car",
      position: 2,
      destination: 6,
      path: [5, 3],
      progress: 0.5,
    },
    {
      id: 3,
      type: "car",
      position: 8,
      destination: 0,
      path: [7, 4, 1],
      progress: 0.7,
    },
  ]

  return {
    intersections,
    roads,
    vehicles,
  }
}

// Create a traffic light with default settings
function createTrafficLight(initialState: "red" | "yellow" | "green"): TrafficLight {
  return {
    state: initialState,
    timer: 0,
    defaultDuration: {
      red: 30,
      yellow: 5,
      green: 30,
    },
  }
}

// Update traffic state for each simulation step
export function updateTrafficState(state: TrafficState, ambulances: Vehicle[]): TrafficState {
  // Create a deep copy of the state to avoid mutating the original
  const newState: TrafficState = JSON.parse(JSON.stringify(state))

  // Update traffic lights
  newState.intersections.forEach((intersection) => {
    if (!intersection.trafficLight) return

    const light = intersection.trafficLight
    light.timer += 1

    // Check if we need to change the light state
    if (light.state === "green" && light.timer >= light.defaultDuration.green) {
      light.state = "yellow"
      light.timer = 0
    } else if (light.state === "yellow" && light.timer >= light.defaultDuration.yellow) {
      light.state = "red"
      light.timer = 0
    } else if (light.state === "red" && light.timer >= light.defaultDuration.red) {
      light.state = "green"
      light.timer = 0
    }
  })

  // Handle ambulances - prioritize their routes
  if (ambulances.length > 0) {
    // For each ambulance, find its path and optimize traffic lights
    ambulances.forEach((ambulance) => {
      // If ambulance has no path yet, calculate it
      if (!ambulance.path || ambulance.path.length === 0) {
        ambulance.path = findShortestPath(
          newState.intersections,
          newState.roads,
          ambulance.position,
          ambulance.destination,
        )
      }

      // Get the next few intersections in the ambulance's path
      const currentPathIndex = ambulance.path.findIndex((id) => id === ambulance.position)
      const upcomingIntersections = ambulance.path
        .slice(currentPathIndex, currentPathIndex + 3)
        .filter((id) => id !== ambulance.position)

      // Set those traffic lights to green
      upcomingIntersections.forEach((intersectionId) => {
        const intersection = newState.intersections.find((i) => i.id === intersectionId)
        if (intersection && intersection.trafficLight) {
          // If it's red, change to green immediately
          if (intersection.trafficLight.state === "red") {
            intersection.trafficLight.state = "green"
            intersection.trafficLight.timer = 0
          }
          // If it's yellow, extend it to stay green longer
          else if (intersection.trafficLight.state === "green") {
            intersection.trafficLight.timer = 0 // Reset timer to keep it green longer
          }
        }
      })

      // Move the ambulance along its path
      if (ambulance.path.length > 0) {
        ambulance.progress += 0.05 // Move faster than regular cars

        // If reached the next intersection
        if (ambulance.progress >= 1) {
          ambulance.position = ambulance.path[0]
          ambulance.path.shift()
          ambulance.progress = 0

          // If reached destination
          if (ambulance.path.length === 0) {
            // Ambulance has reached its destination
            // This would be handled by removing it from the ambulances array
          }
        }
      }
    })
  }

  // Move regular vehicles
  newState.vehicles.forEach((vehicle) => {
    if (vehicle.path.length > 0) {
      // Check if the next intersection has a green light
      const nextIntersectionId = vehicle.path[0]
      const nextIntersection = newState.intersections.find((i) => i.id === nextIntersectionId)

      // Move the vehicle if the light is green or there's no light
      const canMove = !nextIntersection?.trafficLight || nextIntersection.trafficLight.state === "green"

      if (canMove) {
        vehicle.progress += 0.02

        // If reached the next intersection
        if (vehicle.progress >= 1) {
          vehicle.position = vehicle.path[0]
          vehicle.path.shift()
          vehicle.progress = 0

          // If reached destination, generate a new random destination
          if (vehicle.path.length === 0) {
            const newDestination = Math.floor(Math.random() * newState.intersections.length)
            vehicle.destination = newDestination
            vehicle.path = findShortestPath(newState.intersections, newState.roads, vehicle.position, newDestination)
          }
        }
      }
    } else {
      // If vehicle has no path, generate one
      vehicle.path = findShortestPath(newState.intersections, newState.roads, vehicle.position, vehicle.destination)
    }
  })

  return newState
}
