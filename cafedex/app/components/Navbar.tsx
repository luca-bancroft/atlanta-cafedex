"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";

type NavbarProps = {
  onAddEntry?: () => void;
};

export default function Navbar({ onAddEntry }: NavbarProps) {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="navbar">
      <Link href="/" className="navbar-title">
        Cafedex
      </Link>
      {status === "authenticated" ? (
        <div className="navbar-account">
          <div className="navbar-menu" ref={menuRef}>
            <button
              type="button"
              className="navbar-name-button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {session.user?.name}
              <span className="navbar-chevron" aria-hidden="true">
                ▾
              </span>
            </button>
            {menuOpen && (
              <div className="navbar-dropdown" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="navbar-dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
          {onAddEntry && (
            <button
              type="button"
              className="add-entry-button"
              onClick={onAddEntry}
            >
              + Add Entry
            </button>
          )}
        </div>
      ) : (
        <Link href="/login" className="login-button">
          Log in
        </Link>
      )}
    </div>
  );
}
