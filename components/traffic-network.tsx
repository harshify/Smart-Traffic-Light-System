"use client"

import { useRef, useEffect } from "react"
import type { Intersection, Road, Vehicle } from "@/lib/types"

interface TrafficNetworkProps {
  intersections: Intersection[]
  roads: Road[]
  vehicles: Vehicle[]
}

export default function TrafficNetwork({ intersections, roads, vehicles }: TrafficNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw roads
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 4

    roads.forEach((road) => {
      const start = intersections.find((i) => i.id === road.startId)
      const end = intersections.find((i) => i.id === road.endId)

      if (start && end) {
        ctx.beginPath()
        ctx.moveTo(start.x * canvas.width, start.y * canvas.height)
        ctx.lineTo(end.x * canvas.width, end.y * canvas.height)
        ctx.stroke()

        // Draw direction arrow
        const arrowSize = 10
        const dx = end.x - start.x
        const dy = end.y - start.y
        const angle = Math.atan2(dy, dx)

        const midX = ((start.x + end.x) / 2) * canvas.width
        const midY = ((start.y + end.y) / 2) * canvas.height

        ctx.beginPath()
        ctx.moveTo(midX, midY)
        ctx.lineTo(midX - arrowSize * Math.cos(angle - Math.PI / 6), midY - arrowSize * Math.sin(angle - Math.PI / 6))
        ctx.lineTo(midX - arrowSize * Math.cos(angle + Math.PI / 6), midY - arrowSize * Math.sin(angle + Math.PI / 6))
        ctx.closePath()
        ctx.fillStyle = "#333"
        ctx.fill()
      }
    })

    // Draw intersections
    intersections.forEach((intersection) => {
      ctx.beginPath()
      ctx.arc(intersection.x * canvas.width, intersection.y * canvas.height, 15, 0, 2 * Math.PI)

      // Color based on traffic light state
      if (intersection.trafficLight) {
        ctx.fillStyle =
          intersection.trafficLight.state === "green"
            ? "#4CAF50"
            : intersection.trafficLight.state === "yellow"
              ? "#FFEB3B"
              : "#F44336"
      } else {
        ctx.fillStyle = "#999"
      }

      ctx.fill()
      ctx.stroke()

      // Draw intersection ID
      ctx.fillStyle = "#fff"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(intersection.id.toString(), intersection.x * canvas.width, intersection.y * canvas.height)
    })

    // Draw vehicles
    vehicles.forEach((vehicle) => {
      const currentIntersection = intersections.find((i) => i.id === vehicle.position)
      if (!currentIntersection) return

      // Find next intersection if vehicle is moving
      let nextIntersection = null
      if (vehicle.path && vehicle.path.length > 0) {
        const nextId = vehicle.path[0]
        nextIntersection = intersections.find((i) => i.id === nextId)
      }

      let x = currentIntersection.x
      let y = currentIntersection.y

      // If there's a next intersection, interpolate position based on progress
      if (nextIntersection && vehicle.progress) {
        x = currentIntersection.x + (nextIntersection.x - currentIntersection.x) * vehicle.progress
        y = currentIntersection.y + (nextIntersection.y - currentIntersection.y) * vehicle.progress
      }

      // Draw vehicle
      ctx.beginPath()
      ctx.arc(x * canvas.width, y * canvas.height, vehicle.type === "ambulance" ? 10 : 6, 0, 2 * Math.PI)

      ctx.fillStyle = vehicle.type === "ambulance" ? "#F44336" : "#2196F3"
      ctx.fill()

      // Add a cross for ambulance
      if (vehicle.type === "ambulance") {
        ctx.strokeStyle = "#fff"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x * canvas.width - 5, y * canvas.height)
        ctx.lineTo(x * canvas.width + 5, y * canvas.height)
        ctx.moveTo(x * canvas.width, y * canvas.height - 5)
        ctx.lineTo(x * canvas.width, y * canvas.height + 5)
        ctx.stroke()
      }
    })
  }, [intersections, roads, vehicles])

  return (
    <div className="w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
      <canvas ref={canvasRef} className="w-full aspect-[4/3]" />
    </div>
  )
}
