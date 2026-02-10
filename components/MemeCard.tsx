"use client";

import { useState, useEffect } from "react";
import { tx, id } from "@instantdb/react";
import { db } from "@/lib/db";
import { getFileUrl } from "@/lib/fileStorage";
import Link from "next/link";

interface MemeCardProps {
  meme: {
    id: string;
    title: string;
    imageFileId: string;
    userId: string;
    isPublic: boolean;
    createdAt: number;
  };
  upvoteCount: number;
  hasUpvoted: boolean;
}

export default function MemeCard({ meme, upvoteCount, hasUpvoted }: MemeCardProps) {
  const { user } = db.useAuth();
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [currentUpvoteCount, setCurrentUpvoteCount] = useState(upvoteCount);
  const [currentHasUpvoted, setCurrentHasUpvoted] = useState(hasUpvoted);

  // Query user's upvote for this meme
  const { data: upvoteData } = db.useQuery({
    upvotes: {
      $: {
        where: user
          ? {
              userId: user.id,
              memeId: meme.id,
            }
          : { memeId: "" }, // Empty query if no user
      },
    },
  });

  // Update state when upvote data changes
  useEffect(() => {
    if (upvoteData?.upvotes) {
      const userUpvote = upvoteData.upvotes.find(
        (u) => u.userId === user?.id && u.memeId === meme.id
      );
      setCurrentHasUpvoted(!!userUpvote);
    }
  }, [upvoteData, user, meme.id]);

  // Update count from props when it changes
  useEffect(() => {
    setCurrentUpvoteCount(upvoteCount);
  }, [upvoteCount]);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please sign in to upvote memes");
      return;
    }

    if (isUpvoting) return;

    setIsUpvoting(true);

    try {
      const existingUpvote = upvoteData?.upvotes?.find(
        (u) => u.userId === user.id && u.memeId === meme.id
      );

      if (existingUpvote) {
        // Remove upvote
        await db.transact(tx.upvotes[existingUpvote.id].delete());
        setCurrentUpvoteCount((prev) => Math.max(0, prev - 1));
        setCurrentHasUpvoted(false);
      } else {
        // Add upvote
        const upvoteId = id();
        await db.transact(tx.upvotes[upvoteId].update({
          userId: user.id,
          memeId: meme.id,
          createdAt: Date.now(),
        }));
        setCurrentUpvoteCount((prev) => prev + 1);
        setCurrentHasUpvoted(true);
      }
    } catch (error) {
      console.error("Error upvoting:", error);
      alert("Failed to upvote. Please try again.");
    } finally {
      setIsUpvoting(false);
    }
  };

  const imageUrl = getFileUrl(meme.imageFileId);

  return (
    <Link href={`/meme/${meme.id}`} className="meme-card">
      <img src={imageUrl} alt={meme.title} className="meme-card-image" />
      <div className="meme-card-footer">
        <div>
          <div className="meme-card-title">{meme.title}</div>
          <div className="meme-card-meta">
            {new Date(meme.createdAt).toLocaleDateString()}
          </div>
        </div>
        <button
          className={`upvote-button ${currentHasUpvoted ? "upvoted" : ""}`}
          onClick={handleUpvote}
          disabled={!user || isUpvoting}
        >
          <span>▲</span>
          <span>{currentUpvoteCount}</span>
        </button>
      </div>
    </Link>
  );
}
