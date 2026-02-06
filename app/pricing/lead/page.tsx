import { Suspense } from "react";
import LeadClient from "./LeadClient";

export default function LeadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen burocrowd-bg" />}>
      <LeadClient />
    </Suspense>
  );
}
