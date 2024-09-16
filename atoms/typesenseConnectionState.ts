import { atom } from "recoil";

// Function to get initial state from localStorage
const getInitialTypesenseConnectionState = () => {
  if (typeof window !== "undefined") {
    const savedState = localStorage.getItem("typesenseState");
    return savedState
      ? JSON.parse(savedState)
      : {
          host: "",
          port: "",
          protocol: "http",
          apiKey: "",
          isConnected: false,
        };
  }
  return {
    host: "",
    port: "",
    protocol: "http",
    apiKey: "",
    isConnected: false,
  };
};

export const typesenseConnectionState = atom({
  key: "typesenseConnectionState",
  default: getInitialTypesenseConnectionState(),
});
