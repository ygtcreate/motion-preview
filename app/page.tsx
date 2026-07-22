"use client";

import dynamic from "next/dynamic";

const MotionStudio = dynamic(() => import("./components/MotionStudio"), {
  ssr: false,
  loading: () => <main aria-busy="true" aria-label="Motion Studioを読み込み中" />,
});

export default function Home() {
  return <MotionStudio />;
}
