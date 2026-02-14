"use client";

import { useEffect } from "react";
import { initEventEngine, track, EVENT_NAMES } from "@/lib/events";

interface Props {
  slug: string;
}

export default function EventInit({ slug }: Props) {
  useEffect(() => {
    initEventEngine(slug);
    track(EVENT_NAMES.PAGE_VIEW, { path: window.location.pathname });
  }, [slug]);

  return null;
}
