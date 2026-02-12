"use client";

import { useState } from "react";
import type { RoomTypePhoto } from "@/lib/types";

interface Props {
  photos: RoomTypePhoto[];
  name: string;
}

export default function PhotoGallery({ photos, name }: Props) {
  const [selected, setSelected] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="h-[300px] sm:h-[400px] lg:h-[500px] bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-primary-300 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
          <p className="text-primary-400 font-sans text-sm">Sin fotos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-[300px] sm:h-[400px] lg:h-[500px] bg-primary-100 rounded-lg overflow-hidden">
        <img
          src={photos[selected]?.image}
          alt={photos[selected]?.caption || name}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>
      {photos.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {photos.map((photo, idx) => (
            <button
              key={photo.id}
              onClick={() => setSelected(idx)}
              className={`h-24 w-32 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 ${
                idx === selected
                  ? "ring-2 ring-accent-500 ring-offset-2 opacity-100"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={photo.image}
                alt={photo.caption}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
