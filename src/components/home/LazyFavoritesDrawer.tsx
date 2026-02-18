"use client";

import dynamic from "next/dynamic";

const FavoritesDrawer = dynamic(() => import("@/components/home/FavoritesDrawer"), { ssr: false });

export default function LazyFavoritesDrawer() {
  return <FavoritesDrawer />;
}
