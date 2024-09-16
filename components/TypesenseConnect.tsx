"use client";

import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { typesenseConnectionState } from "@/atoms/typesenseConnectionState";

export default function TypesenseConnect() {
  const [formData, setFormData] = useState({
    host: "",
    port: "",
    protocol: "http",
    apiKey: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const [typesense, setTypesense] = useRecoilState(typesenseConnectionState);

  // Sync Recoil state to formData when component mounts
  useEffect(() => {
    setFormData({
      host: typesense.host,
      port: typesense.port,
      protocol: typesense.protocol,
      apiKey: typesense.apiKey,
    });
  }, [typesense]);

  // Update localStorage whenever Recoil state changes
  useEffect(() => {
    localStorage.setItem("typesenseState", JSON.stringify(typesense));
  }, [typesense]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setConnectionStatus("idle");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

      // In a real-world scenario, you'd validate the credentials with an API call
      setConnectionStatus("success");

      // Store the credentials in Recoil state and localStorage
      setTypesense({
        ...formData,
        isConnected: true,
      });
    } catch (error) {
      setConnectionStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setTypesense({
      host: "",
      port: "",
      protocol: "http",
      apiKey: "",
      isConnected: false,
    });
    localStorage.removeItem("typesenseState");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connect to Typesense</CardTitle>
          <CardDescription>
            Enter your Typesense server details to connect
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  name="host"
                  placeholder="localhost"
                  value={formData.host}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  name="port"
                  placeholder="8108"
                  value={formData.port}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="protocol">Protocol</Label>
                <Input
                  id="protocol"
                  name="protocol"
                  placeholder="http"
                  value={formData.protocol}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  name="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Connecting..." : "Connect to Typesense"}
          </Button>
          {connectionStatus === "success" && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Successfully connected to Typesense server.
              </AlertDescription>
            </Alert>
          )}
          {connectionStatus === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to connect to Typesense server. Please check your details
                and try again.
              </AlertDescription>
            </Alert>
          )}
          <Button onClick={handleDisconnect}>Disconnect</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
