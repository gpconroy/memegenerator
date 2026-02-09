"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { db } from "@/lib/db";
import AuthModal from "./AuthModal";

export default function Navigation() {
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);
  let authResult;
  try {
    authResult = db.useAuth();
  } catch (error) {
    authResult = { user: null };
  }
  const { user } = authResult || { user: null };

  const handleSignOut = async () => {
    await db.auth.signOut();
  };

  return (
    <>
      <nav className="nav">
        <div className="nav-links">
          <Link
            href="/"
            className={`nav-link ${pathname === "/" ? "active" : ""}`}
          >
            Editor
          </Link>
          <Link
            href="/gallery"
            className={`nav-link ${pathname === "/gallery" ? "active" : ""}`}
          >
            Gallery
          </Link>
        </div>
        <div className="auth-section">
          {user ? (
            <div className="user-info">
              <span>{user.email}</span>
              <button className="auth-button" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          ) : (
            <button
              className="auth-button primary"
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
