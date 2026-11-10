"use client";

import { useCallback, useEffect } from "react";
import { CircleHelp } from "lucide-react";
import { driver } from "driver.js";
import { Button } from "@/components/ui/button";

export function TourButton({ role }: { role: "AUTHOR" | "ADMIN" }) {
  const start = useCallback(() => {
    const tour = driver({
      showProgress: true,
      allowClose: true,
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Done",
      steps: role === "ADMIN" ? [
        { element: "[data-tour='overview']", popover: { title: "Operations overview", description: "See ticket volume, urgency, and recent support activity at a glance." } },
        { element: "[data-tour='tickets']", popover: { title: "Ticket queue", description: "Search, filter, prioritize, assign, and work every author request." } },
        { element: "[data-tour='tour']", popover: { title: "Restart anytime", description: "Use this button whenever you want to replay the admin tour." } },
      ] : [
        { element: "[data-tour='overview']", popover: { title: "Your publishing overview", description: "Track books, sales, royalty balances, and active support requests." } },
        { element: "[data-tour='books']", popover: { title: "Your books", description: "Review publication, distribution, sales, and royalty details." } },
        { element: "[data-tour='tickets']", popover: { title: "Support conversations", description: "Open a request and follow every response in one place." } },
        { element: "[data-tour='tour']", popover: { title: "Restart anytime", description: "Use this button whenever you want to replay the author tour." } },
      ],
      onDestroyed: () => localStorage.setItem(`bookleaf-tour-${role}`, "seen"),
    });
    tour.drive();
  }, [role]);

  useEffect(() => {
    if (!localStorage.getItem(`bookleaf-tour-${role}`)) {
      const timer = window.setTimeout(start, 700);
      return () => window.clearTimeout(timer);
    }
  }, [role, start]);

  return <Button data-tour="tour" variant="ghost" size="sm" onClick={start} aria-label="Start product tour"><CircleHelp className="size-4" /><span className="hidden lg:inline">Tour</span></Button>;
}
