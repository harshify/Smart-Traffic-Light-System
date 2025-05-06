import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AlgorithmExplanation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Algorithm Explanation</CardTitle>
        <CardDescription>How the smart traffic system works</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
            <TabsTrigger value="code">C++ Code</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <p className="text-sm">
              This smart traffic system uses graph algorithms to optimize traffic flow and prioritize emergency
              vehicles.
            </p>
            <p className="text-sm">The traffic network is represented as a graph where:</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-2">
              <li>Intersections are nodes</li>
              <li>Roads are edges</li>
              <li>Traffic lights control flow at intersections</li>
              <li>Vehicles (including ambulances) move along the edges</li>
            </ul>
            <p className="text-sm mt-2">
              When an ambulance enters the system, the algorithm calculates the shortest path to its destination and
              adjusts traffic lights along the route to minimize delays.
            </p>
          </TabsContent>

          <TabsContent value="algorithm" className="space-y-4 mt-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">1. Path Finding</h3>
              <p className="text-sm">
                We use Dijkstra's algorithm to find the shortest path for ambulances. This algorithm:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>Assigns weights to roads based on length and traffic</li>
                <li>Finds the optimal path from start to destination</li>
                <li>Updates in real-time as traffic conditions change</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-sm">2. Traffic Light Optimization</h3>
              <p className="text-sm">When an ambulance is detected:</p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                <li>Traffic lights along its path turn green</li>
                <li>Perpendicular traffic is temporarily stopped</li>
                <li>Normal operation resumes after the ambulance passes</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-sm">3. Coordination</h3>
              <p className="text-sm">
                The system coordinates multiple intersections to create a "green wave" for the ambulance, minimizing
                stops and ensuring rapid transit through the network.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="code" className="mt-4">
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-[300px]">
              {`// C++ implementation of the traffic optimization algorithm

#include <iostream>
#include <vector>
#include <queue>
#include <limits>
#include <unordered_map>

// Graph representation of the traffic network
class TrafficNetwork {
private:
    struct Edge {
        int to;
        double weight;
        bool hasTrafficLight;
    };
    
    std::vector<std::vector<Edge>> adjacencyList;
    std::unordered_map<int, std::string> trafficLightStates;
    
public:
    TrafficNetwork(int numIntersections) {
        adjacencyList.resize(numIntersections);
    }
    
    void addRoad(int from, int to, double weight, bool hasTrafficLight) {
        adjacencyList[from].push_back({to, weight, hasTrafficLight});
        if (hasTrafficLight) {
            trafficLightStates[from] = "red"; // Default state
        }
    }
    
    // Dijkstra's algorithm to find shortest path for ambulance
    std::vector<int> findShortestPath(int start, int end) {
        std::vector<double> dist(adjacencyList.size(), std::numeric_limits<double>::infinity());
        std::vector<int> prev(adjacencyList.size(), -1);
        std::priority_queue<std::pair<double, int>, 
                           std::vector<std::pair<double, int>>, 
                           std::greater<std::pair<double, int>>> pq;
        
        dist[start] = 0;
        pq.push({0, start});
        
        while (!pq.empty()) {
            int u = pq.top().second;
            double d = pq.top().first;
            pq.pop();
            
            if (d > dist[u]) continue;
            
            for (const Edge& edge : adjacencyList[u]) {
                int v = edge.to;
                double weight = edge.weight;
                
                // Reduce weight for ambulances (priority)
                if (dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    prev[v] = u;
                    pq.push({dist[v], v});
                }
            }
        }
        
        // Reconstruct path
        std::vector<int> path;
        for (int at = end; at != -1; at = prev[at]) {
            path.push_back(at);
        }
        std::reverse(path.begin(), path.end());
        
        return path.size() > 1 ? path : std::vector<int>();
    }
    
    // Optimize traffic lights for ambulance path
    void optimizeForAmbulance(const std::vector<int>& path) {
        // Reset all traffic lights
        for (auto& pair : trafficLightStates) {
            pair.second = "red";
        }
        
        // Set traffic lights to green along the ambulance path
        for (size_t i = 0; i < path.size() - 1; i++) {
            int intersection = path[i];
            if (trafficLightStates.find(intersection) != trafficLightStates.end()) {
                trafficLightStates[intersection] = "green";
            }
        }
    }
    
    // Get current traffic light state
    std::string getTrafficLightState(int intersection) {
        if (trafficLightStates.find(intersection) != trafficLightStates.end()) {
            return trafficLightStates[intersection];
        }
        return "none"; // No traffic light at this intersection
    }
};

// Main function demonstrating usage
int main() {
    // Create a sample traffic network
    TrafficNetwork network(6);
    
    // Add roads (from, to, weight, hasTrafficLight)
    network.addRoad(0, 1, 2.0, true);
    network.addRoad(0, 2, 4.0, true);
    network.addRoad(1, 3, 2.5, true);
    network.addRoad(2, 3, 1.0, true);
    network.addRoad(2, 4, 3.0, false);
    network.addRoad(3, 5, 1.0, true);
    network.addRoad(4, 5, 2.0, true);
    
    // Find path for ambulance from intersection 0 to 5
    std::vector<int> ambulancePath = network.findShortestPath(0, 5);
    
    // Print the path
    std::cout << "Ambulance path: ";
    for (int node : ambulancePath) {
        std::cout << node << " ";
    }
    std::cout << std::endl;
    
    // Optimize traffic lights for ambulance
    network.optimizeForAmbulance(ambulancePath);
    
    // Print traffic light states
    std::cout << "Traffic light states after optimization:" << std::endl;
    for (int i = 0; i < 6; i++) {
        std::cout << "Intersection " << i << ": " 
                  << network.getTrafficLightState(i) << std::endl;
    }
    
    return 0;
}
`}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
