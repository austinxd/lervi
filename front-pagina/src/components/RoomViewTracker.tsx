"use client";

import { useEffect } from "react";
import { track, EVENT_NAMES } from "@/lib/events";

interface Props {
  roomId: string;
  roomName: string;
}

export default function RoomViewTracker({ roomId, roomName }: Props) {
  useEffect(() => {
    track(EVENT_NAMES.ROOM_VIEW, { room_id: roomId, room_name: roomName });
  }, [roomId, roomName]);

  return null;
}
