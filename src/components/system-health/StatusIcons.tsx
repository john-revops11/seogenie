
import { Check, X, Wifi, WifiOff, AlertTriangle, LoaderCircle, Database } from "lucide-react";
import { ApiStatus } from "./types";

export const renderHealthIcon = (healthStatus: "healthy" | "degraded" | "critical" | "unknown") => {
  switch(healthStatus) {
    case "healthy":
      return <Check className="h-4 w-4 text-green-500" />;
    case "degraded":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case "critical":
      return <X className="h-4 w-4 text-red-500" />;
    case "unknown":
    default:
      return <LoaderCircle className="h-4 w-4 animate-spin" />;
  }
};

export const renderStatusIcon = (status: ApiStatus, apiId: string) => {
  if (apiId === "pinecone") {
    if (status === "connected") return <Database className="h-4 w-4 text-green-500" />;
    if (status === "disconnected") return <Database className="h-4 w-4 text-slate-400" />;
    if (status === "error") return <Database className="h-4 w-4 text-red-500" />;
    return <LoaderCircle className="h-4 w-4 animate-spin text-slate-400" />;
  }
  
  switch(status) {
    case "connected":
      return <Wifi className="h-4 w-4 text-green-500" />;
    case "disconnected":
      return <WifiOff className="h-4 w-4 text-slate-400" />;
    case "error":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "checking":
      return <LoaderCircle className="h-4 w-4 animate-spin text-slate-400" />;
  }
};

export const renderTestResultIcon = (status: "idle" | "success" | "error" | "loading") => {
  switch(status) {
    case "success":
      return <Check className="h-4 w-4 text-green-500" />;
    case "error":
      return <X className="h-4 w-4 text-red-500" />;
    case "loading":
      return <LoaderCircle className="h-4 w-4 animate-spin text-slate-400" />;
    default:
      return null;
  }
};
