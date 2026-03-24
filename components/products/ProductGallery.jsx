"use client";

import React, { useState } from "react";
import Image from "next/image";

const FALLBACK_IMAGE =
  "https://images.pexels.com/photos/5632396/pexels-photo-5632396.jpeg?auto=compress&cs=tinysrgb&w=600";

export default function ProductGallery({ images, videoUrl, name, discountPercentage }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const showingVideo = selectedIndex === -1;

  return (
    <div className="space-y-4">
      <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
        {showingVideo && videoUrl ? (
          videoUrl.includes("youtube.com") || videoUrl.includes("vimeo.com") ? (
            <iframe
              src={videoUrl}
              title={name}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={videoUrl} controls className="w-full h-full object-cover" />
          )
        ) : (
          <Image
            src={images[selectedIndex] || FALLBACK_IMAGE}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        )}
        {discountPercentage > 0 && !showingVideo && (
          <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            -{discountPercentage}% OFF
          </span>
        )}
      </div>

      {(images.length > 1 || videoUrl) && (
        <div className="flex space-x-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                selectedIndex === i ? "border-primary-600" : "border-gray-200"
              }`}
            >
              <Image
                src={img}
                alt={`${name} ${i + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {videoUrl && (
            <button
              onClick={() => setSelectedIndex(-1)}
              className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 flex items-center justify-center bg-gray-900 ${
                selectedIndex === -1 ? "border-primary-600" : "border-gray-200"
              }`}
            >
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
