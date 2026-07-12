"use client";
import { useState, useCallback, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  variant?: Variant;
  loading?: boolean;              // controlled loading (optional)
  loadingText?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

/**
 * Standard action button. If onClick returns a promise, the button shows a
 * spinner and disables itself until it settles — so every action gives
 * immediate feedback (HCI: visibility of system status) with zero per-call
 * boilerplate. Pass `loading` to control it externally instead.
 */
export function Button({ variant = "primary", loading, loadingText, onClick, disabled, children, className = "", ...rest }: Props) {
  const [busy, setBusy] = useState(false);
  const isLoading = loading ?? busy;

  const handle = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;
    const r = onClick(e);
    if (r instanceof Promise) {
      setBusy(true);
      try { await r; } finally { setBusy(false); }
    }
  }, [onClick]);

  return (
    <button
      {...rest}
      onClick={handle}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`btn btn-${variant} ${className}`}
    >
      {isLoading && <span className="spinner" aria-hidden />}
      <span>{isLoading && loadingText ? loadingText : children}</span>
    </button>
  );
}
