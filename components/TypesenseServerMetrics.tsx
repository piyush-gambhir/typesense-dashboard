"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  RefreshCw,
  Server,
  Database,
  Search,
  Clock,
  Cpu,
  BarChart,
  HardDrive,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

type ServerMetrics = {
  status: "online" | "offline";
  uptime: number;
  numDocuments: number;
  numCollections: number;
  numSearches: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
};

export default function TypesenseServerMetrics() {
  const [metrics, setMetrics] = useState<ServerMetrics>({
    status: "online",
    uptime: 0,
    numDocuments: 0,
    numCollections: 0,
    numSearches: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // In a real application, you would fetch actual data from your Typesense server
      setMetrics({
        status: "online",
        uptime: Math.floor(Math.random() * 1000000),
        numDocuments: Math.floor(Math.random() * 1000000),
        numCollections: Math.floor(Math.random() * 100),
        numSearches: Math.floor(Math.random() * 10000),
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        diskUsage: Math.random() * 100,
      });
    } catch (err) {
      setError("Failed to fetch server metrics. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="w-full p-4">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Typesense Server Status & Metrics
          </CardTitle>
          <CardDescription>
            Real-time overview of your Typesense server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Server Status
                </CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.status === "online" ? (
                    <span className="text-green-600">Online</span>
                  ) : (
                    <span className="text-red-600">Offline</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Uptime: {formatUptime(metrics.uptime)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Documents
                </CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.numDocuments.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {metrics.numCollections} collections
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Searches
                </CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.numSearches.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Since last server restart
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.cpuUsage.toFixed(2)}%
                </div>
                <Progress value={metrics.cpuUsage} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Memory Usage
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.memoryUsage.toFixed(2)}%
                </div>
                <Progress value={metrics.memoryUsage} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Disk Usage
                </CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.diskUsage.toFixed(2)}%
                </div>
                <Progress value={metrics.diskUsage} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={fetchMetrics} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Metrics
          </Button>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </CardFooter>
      </Card>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
