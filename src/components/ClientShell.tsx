"use client";

import Toast from "@/components/Toast";
import ScrollToTop from "@/components/ScrollToTop";
import PageViewTracker from "@/components/PageViewTracker";
import RecommendationPopup from "@/components/RecommendationPopup";
import AgeGate from "@/components/AgeGate";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function ClientShell() {
  return (
    <>
      <AgeGate />
      <Toast />
      <ScrollToTop />
      <PageViewTracker />
      <RecommendationPopup />
      <MobileBottomNav />
    </>
  );
}
