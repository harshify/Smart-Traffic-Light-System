"use client"

import { useState } from "react"
import type { Vehicle, Intersection } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Plus, Trash2 } from "lucide-react"

interface SimulationControlsProps {
  isRunning: boolean
  setIsRunning: (value: boolean) => void
  speed: number
  setSpeed: (value: number) => void
  addAmbulance: (startId: number, endId: number) => void
  removeAmbulance: (id: number) => void
  ambulances: Vehicle[]
  intersections: Intersection[]
}

export default function SimulationControls({
  isRunning,
  setIsRunning,
  speed,
  setSpeed,
  addAmbulance,
  removeAmbulance,
  ambulances,
  intersections,
}: SimulationControlsProps) {
  const [startIntersection, setStartIntersection] = useState<string>("")
  const [endIntersection, setEndIntersection] = useState<string>("")

  const handleAddAmbulance = () => {
    if (startIntersection && endIntersection) {
      addAmbulance(Number.parseInt(startIntersection), Number.parseInt(endIntersection))
      setStartIntersection("")
      setEndIntersection("")
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Simulation Controls</CardTitle>
        <CardDescription>Control the traffic simulation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Simulation</h3>
              <Button
                variant={isRunning ? "destructive" : "default"}
                size="sm"
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isRunning ? "Pause" : "Start"}
              </Button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Speed</span>
                <span>{speed}x</span>
              </div>
              <Slider
                value={[speed]}
                min={0.5}
                max={3}
                step={0.5}
                onValueChange={(value) => setSpeed(value[0])}
                disabled={!isRunning}
              />
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <h3 className="font-medium">Add Emergency Vehicle</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm">Start</label>
                <Select value={startIntersection} onValueChange={setStartIntersection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select intersection" />
                  </SelectTrigger>
                  <SelectContent>
                    {intersections.map((intersection) => (
                      <SelectItem key={intersection.id} value={intersection.id.toString()}>
                        Intersection {intersection.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm">Destination</label>
                <Select value={endIntersection} onValueChange={setEndIntersection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select intersection" />
                  </SelectTrigger>
                  <SelectContent>
                    {intersections.map((intersection) => (
                      <SelectItem
                        key={intersection.id}
                        value={intersection.id.toString()}
                        disabled={intersection.id.toString() === startIntersection}
                      >
                        Intersection {intersection.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleAddAmbulance} disabled={!startIntersection || !endIntersection} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Ambulance
            </Button>
          </div>

          {ambulances.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <h3 className="font-medium">Active Ambulances</h3>
              <div className="space-y-2">
                {ambulances.map((ambulance) => (
                  <div key={ambulance.id} className="flex items-center justify-between bg-red-50 p-2 rounded">
                    <span className="text-sm">
                      Ambulance {ambulance.id}: {ambulance.position} → {ambulance.destination}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => removeAmbulance(ambulance.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
