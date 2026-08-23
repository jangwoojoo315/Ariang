"use client";
import { SearchScreen } from "@/views/search";
import { useTabs } from "../tabs-context";

export default function SearchPage() {
  const { onSelectItem } = useTabs();
  return <SearchScreen onSelectItem={onSelectItem} />;
}
