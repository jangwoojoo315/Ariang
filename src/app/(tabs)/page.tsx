"use client";
import { HomeScreen } from "@/views/home";
import { useTabs } from "./tabs-context";

export default function HomePage() {
  const { onSelectItem, onSelectBundle, onSaveTrip, savedTrips } = useTabs();
  return (
    <HomeScreen
      onSelectItem={onSelectItem}
      onSelectBundle={onSelectBundle}
      onAddTrip={onSaveTrip}
      savedTrips={savedTrips}
    />
  );
}
