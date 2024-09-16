import { atom } from "recoil";

export const sidebarState = atom({
  key: "isSidebarOpen", // unique ID (with respect to other atoms/selectors)
  default: true, // default value (initial state)
});
