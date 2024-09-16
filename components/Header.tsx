"use client";

import { useRecoilState } from "recoil";
import { sidebarState } from "@/atoms/sidebarState";
import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useRecoilState(sidebarState);

  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-background px-4 py-4 shadow-sm dark:shadow-gray-200">
      <div className="flex items-center gap-x-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-primary transition-all"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
        <h1 className="text-lg font-semibold">Typesense Dashboard</h1>
      </div>
      <div className="">
        <ThemeToggle />
      </div>
    </div>
  );
}
