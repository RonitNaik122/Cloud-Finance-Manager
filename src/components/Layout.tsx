
import React from "react";
import { SidebarNav } from "./SidebarNav";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <SidebarNav />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};
