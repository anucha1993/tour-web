"use client";

import dynamic from "next/dynamic";

const ContactPopup = dynamic(() => import("./ContactPopup"), {
  ssr: false,
});

export default function LazyContactPopup() {
  return <ContactPopup />;
}
