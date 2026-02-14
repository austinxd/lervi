import type { EventName, TrackingEvent } from "./eventTypes";

const BUFFER_SIZE = 5;
const FLUSH_INTERVAL_MS = 10_000; // 10 seconds
const MAX_RETRY = 2;
const STORAGE_KEY = "lervi_session_id";
const GUEST_KEY = "lervi_guest_id";

let buffer: TrackingEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let currentSlug = "";

// ---------------------------------------------------------------------------
// Session ID — persistent per browser (localStorage)
// ---------------------------------------------------------------------------

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let sid = localStorage.getItem(STORAGE_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, sid);
  }
  return sid;
}

// ---------------------------------------------------------------------------
// Guest ID — set when guest logs in
// ---------------------------------------------------------------------------

function getGuestId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(GUEST_KEY) || "";
}

export function setGuestId(id: string): void {
  if (typeof window === "undefined") return;
  if (id) {
    localStorage.setItem(GUEST_KEY, id);
  } else {
    localStorage.removeItem(GUEST_KEY);
  }
}

// ---------------------------------------------------------------------------
// Init — call once with the hotel slug
// ---------------------------------------------------------------------------

export function initEventEngine(slug: string): void {
  currentSlug = slug;
  // Start periodic flush
  if (typeof window !== "undefined" && !flushTimer) {
    flushTimer = setInterval(flush, FLUSH_INTERVAL_MS);
    // Flush on page unload
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
    window.addEventListener("beforeunload", flush);
  }
}

// ---------------------------------------------------------------------------
// Track — main public function
// ---------------------------------------------------------------------------

export function track(eventName: EventName, metadata?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!currentSlug) return;

  try {
    const evt: TrackingEvent = {
      event: eventName,
      timestamp: Date.now(),
      session_id: getSessionId(),
      hotel_slug: currentSlug,
      guest_id: getGuestId() || undefined,
      metadata,
    };

    buffer.push(evt);

    if (buffer.length >= BUFFER_SIZE) {
      flush();
    }
  } catch {
    // Never break the UI
  }
}

// ---------------------------------------------------------------------------
// Flush — send buffered events to backend
// ---------------------------------------------------------------------------

async function flush(): Promise<void> {
  if (buffer.length === 0 || !currentSlug) return;

  const batch = [...buffer];
  buffer = [];

  const payload = {
    events: batch.map(({ hotel_slug, ...rest }) => rest),
  };

  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    try {
      const res = await fetch(`/api/${currentSlug}/events/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true, // survive page unload
      });
      if (res.ok) return; // success
    } catch {
      // Network error — retry
    }
    // Wait before retry (200ms, 400ms)
    if (attempt < MAX_RETRY) {
      await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
    }
  }

  // All retries failed — re-add events to buffer (cap at 100 to avoid memory leak)
  buffer = [...batch, ...buffer].slice(0, 100);
}

// ---------------------------------------------------------------------------
// Re-export types for convenience
// ---------------------------------------------------------------------------

export { EVENT_NAMES } from "./eventTypes";
export type { EventName, TrackingEvent } from "./eventTypes";
