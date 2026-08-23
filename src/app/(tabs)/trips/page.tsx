"use client";
import { TripsScreen } from "@/views/trips";
import { useTabs } from "../tabs-context";

export default function TripsPage() {
  const { onSelectItem } = useTabs();
  return <TripsScreen onSelectItem={onSelectItem} />;
}
