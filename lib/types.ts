export interface TrafficLight {
  state: "red" | "yellow" | "green"
  timer: number
  defaultDuration: {
    red: number
    yellow: number
    green: number
  }
}

export interface Intersection {
  id: number
  x: number // Normalized position (0-1)
  y: number // Normalized position (0-1)
  trafficLight?: TrafficLight
}

export interface Road {
  id: number
  startId: number
  endId: number
  length: number
  bidirectional: boolean
}

export interface Vehicle {
  id: number
  type: "car" | "ambulance"
  position: number // Current intersection ID
  destination: number // Target intersection ID
  path: number[] // Path of intersection IDs
  progress: number // Progress between current and next intersection (0-1)
}

export interface TrafficState {
  intersections: Intersection[]
  roads: Road[]
  vehicles: Vehicle[]
}
