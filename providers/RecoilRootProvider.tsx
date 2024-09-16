"use client";
import React from "react";
import { RecoilRoot } from "recoil";

export function RecoilRootProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RecoilRoot>{children}</RecoilRoot>;
}
