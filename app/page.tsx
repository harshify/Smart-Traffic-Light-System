"use client"

import { useState, useEffect } from "react"
import TrafficNetwork from "@/components/traffic-network"
import ControlPanel from "@/components/control-panel"
import SimulationControls from "@/components/simulation-controls"
import AlgorithmExplanation from "@/components/algorithm-explanation"
import type { TrafficState, Vehicle } from "@/lib/types"
import { initializeTrafficState, updateTrafficState } from "@/lib/simulation"

export default function Home() {
  const [trafficState, setTrafficState] = useState<TrafficState | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [ambulances, setAmbulances] = useState<Vehicle[]>([])

  useEffect(() => {
    // Initialize traffic network
    const initialState = initializeTrafficState()
    setTrafficState(initialState)
  }, [])

  useEffect(() => {
    if (!isRunning || !trafficState) return

    const interval = setInterval(() => {
      setTrafficState((prevState) => {
        if (!prevState) return null
        return updateTrafficState(prevState, ambulances)
      })
    }, 1000 / speed)

    return () => clearInterval(interval)
  }, [isRunning, speed, trafficState, ambulances])

  const addAmbulance = (startId: number, endId: number) => {
    const newAmbulance: Vehicle = {
      id: Date.now(),
      type: "ambulance",
      position: startId,
      destination: endId,
      path: [],
      progress: 0,
    }

    setAmbulances((prev) => [...prev, newAmbulance])
  }

  const removeAmbulance = (id: number) => {
    setAmbulances((prev) => prev.filter((ambulance) => ambulance.id !== id))
  }

  if (!trafficState) {
    return <div className="flex items-center justify-center h-screen">Loading simulation...</div>
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Smart Traffic Light System</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">
        <div className="lg:col-span-2">
          <TrafficNetwork
            intersections={trafficState.intersections}
            roads={trafficState.roads}
            vehicles={[...trafficState.vehicles, ...ambulances]}
          />

          <SimulationControls
            isRunning={isRunning}
            setIsRunning={setIsRunning}
            speed={speed}
            setSpeed={setSpeed}
            addAmbulance={addAmbulance}
            removeAmbulance={removeAmbulance}
            ambulances={ambulances}
            intersections={trafficState.intersections}
          />
        </div>

        <div className="space-y-6">
          <ControlPanel intersections={trafficState.intersections} ambulances={ambulances} />

          <AlgorithmExplanation />
        </div>
      </div>
    </main>
  )
}
