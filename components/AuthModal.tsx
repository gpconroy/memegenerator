"use client";

import { useState } from "react";
import { db } from "@/lib/db";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (step === "request") {
        await db.auth.sendMagicCode({ email });
        setStep("verify");
        setCode("");
      } else {
        await db.auth.signInWithMagicCode({ email, code });
        onClose();
        setEmail("");
        setCode("");
        setStep("request");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2 className="auth-modal-title">
            {step === "request" ? "Sign In / Sign Up" : "Enter Code"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {step === "verify" && (
            <input
              type="text"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          )}
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading
              ? "Loading..."
              : step === "request"
              ? "Send Code"
              : "Verify & Sign In"}
          </button>
          {step === "verify" && (
            <button
              type="button"
              onClick={() => {
                setStep("request");
                setError("");
              }}
              style={{ background: "transparent", color: "#666" }}
            >
              Change email
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
