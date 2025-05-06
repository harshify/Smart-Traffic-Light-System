"use client"

import { useState } from "react"
import type { Intersection, Vehicle } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ControlPanelProps {
  intersections: Intersection[]
  ambulances: Vehicle[]
}

export default function ControlPanel({ intersections, ambulances }: ControlPanelProps) {
  const [selectedTab, setSelectedTab] = useState("intersections")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Control Panel</CardTitle>
        <CardDescription>Monitor and control traffic system</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="intersections">Intersections</TabsTrigger>
            <TabsTrigger value="ambulances">
              Ambulances
              {ambulances.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {ambulances.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="intersections" className="space-y-4 mt-4">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {intersections.map((intersection) => (
                <div
                  key={intersection.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
                >
                  <div>
                    <h3 className="font-medium">Intersection {intersection.id}</h3>
                    <p className="text-sm text-gray-500">
                      {intersection.trafficLight
                        ? `Signal: ${intersection.trafficLight.state.toUpperCase()}`
                        : "No traffic light"}
                    </p>
                  </div>

                  {intersection.trafficLight && (
                    <div
                      className={`w-4 h-4 rounded-full ${
                        intersection.trafficLight.state === "green"
                          ? "bg-green-500"
                          : intersection.trafficLight.state === "yellow"
                            ? "bg-yellow-400"
                            : "bg-red-500"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ambulances" className="space-y-4 mt-4">
            {ambulances.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No ambulances in the system</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {ambulances.map((ambulance) => {
                  const currentIntersection = intersections.find((i) => i.id === ambulance.position)
                  const destinationIntersection = intersections.find((i) => i.id === ambulance.destination)

                  return (
                    <div key={ambulance.id} className="p-3 bg-red-50 rounded-md border border-red-200">
                      <h3 className="font-medium flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                        Ambulance {ambulance.id}
                      </h3>
                      <p className="text-sm mt-1">From: Intersection {currentIntersection?.id || "Unknown"}</p>
                      <p className="text-sm">To: Intersection {destinationIntersection?.id || "Unknown"}</p>
                      {ambulance.path && ambulance.path.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Path:</p>
                          <p className="text-xs">{[ambulance.position, ...ambulance.path].join(" → ")}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
