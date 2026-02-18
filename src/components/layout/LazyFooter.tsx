"use client";

import dynamic from "next/dynamic";

const Footer = dynamic(() => import("./Footer"), {
  ssr: false,
  loading: () => <footer className="bg-gray-900 text-white py-16"><div className="container-custom" /></footer>,
});

export default function LazyFooter() {
  return <Footer />;
}
