"use client";

import dynamic from "next/dynamic";

const OurClients = dynamic(() => import("@/components/home/OurClients"), { ssr: false });
const CustomerReviews = dynamic(() => import("@/components/home/CustomerReviews"), { ssr: false });
const WhyChooseUs = dynamic(() => import("@/components/home/WhyChooseUs"), { ssr: false });
const PopupModal = dynamic(() => import("@/components/home/PopupModal"), { ssr: false });
const LatestBlogPosts = dynamic(() => import("@/components/home/LatestBlogPosts"), { ssr: false });

export { OurClients, CustomerReviews, WhyChooseUs, PopupModal, LatestBlogPosts };
