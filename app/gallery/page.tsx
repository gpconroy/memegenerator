"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import MemeCard from "@/components/MemeCard";
import { db } from "@/lib/db";

type FilterType = "all" | "public" | "mine";

export default function GalleryPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const { user } = db.useAuth();

  // Query memes based on filter
  const { data, isLoading } = db.useQuery({
    memes: {
      $: {
        where: filter === "mine" && user
          ? { userId: user.id }
          : filter === "public"
          ? { isPublic: true }
          : {},
        order: { serverCreatedAt: "desc" },
      },
    },
    upvotes: {},
  });

  // Get upvote counts for each meme
  const getUpvoteCount = (memeId: string) => {
    if (!data?.upvotes) return 0;
    return data.upvotes.filter((upvote) => upvote.memeId === memeId).length;
  };

  const hasUserUpvoted = (memeId: string) => {
    if (!user || !data?.upvotes) return false;
    return data.upvotes.some(
      (upvote) => upvote.userId === user.id && upvote.memeId === memeId
    );
  };

  const memes = data?.memes || [];

  return (
    <>
      <Navigation />
      <div className="gallery-container">
        <div className="gallery-header">
          <h1>Meme Gallery</h1>
          <div className="gallery-filters">
            <button
              className={`filter-button ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`filter-button ${filter === "public" ? "active" : ""}`}
              onClick={() => setFilter("public")}
            >
              Public
            </button>
            {user && (
              <button
                className={`filter-button ${filter === "mine" ? "active" : ""}`}
                onClick={() => setFilter("mine")}
              >
                My Memes
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : memes.length === 0 ? (
          <div>No memes found. Create your first meme!</div>
        ) : (
          <div className="gallery-grid">
            {memes.map((meme) => (
              <MemeCard
                key={meme.id}
                meme={meme}
                upvoteCount={getUpvoteCount(meme.id)}
                hasUpvoted={hasUserUpvoted(meme.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
