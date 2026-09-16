"use client";
import { HomeScreen } from "@/views/home";
import { useTabs } from "./tabs-context";

export default function HomePage() {
  const { onSelectItem } = useTabs();
  return (
    <HomeScreen
      onSelectItem={onSelectItem}
    />
  );
}
