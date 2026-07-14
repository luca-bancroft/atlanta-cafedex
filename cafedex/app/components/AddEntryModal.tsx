"use client";

import { useState, type FormEvent } from "react";
import { WEICK_TAGS, type WeickTag } from "../lib/weick";
import { geocodeAddress } from "../lib/geocode";
import { useModalBehavior } from "../lib/useModalBehavior";
import {
  CriteriaButtons,
  BonusDetrimentFields,
  createEmptyCriteria,
  type BonusMode,
} from "./WeickCriteriaFields";
import type { Cafe } from "../data/cafes";

type AddEntryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cafe: Cafe) => Promise<void>;
};

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "cafe";
}

export default function AddEntryModal({
  isOpen,
  onClose,
  onSubmit,
}: AddEntryModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [metCriteria, setMetCriteria] = useState<Record<WeickTag, boolean>>(
    createEmptyCriteria
  );
  const [bonusMode, setBonusMode] = useState<BonusMode>("none");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useModalBehavior(isOpen, onClose);

  if (!isOpen) return null;

  const resetForm = () => {
    setName("");
    setAddress("");
    setMetCriteria(createEmptyCriteria());
    setBonusMode("none");
    setReason("");
    setDescription("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleCriterion = (tag: WeickTag) => {
    setMetCriteria((prev) => ({ ...prev, [tag]: !prev[tag] }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !address.trim()) {
      setError("Name and address are required.");
      return;
    }
    if (bonusMode !== "none" && !reason.trim()) {
      setError(
        bonusMode === "bonus"
          ? "Add a reason for the bonus star."
          : "Add a reason for the detriment."
      );
      return;
    }

    setSubmitting(true);
    try {
      const geocoded = await geocodeAddress(address);
      if (!geocoded) {
        setError("Couldn't find that address. Try refining it.");
        return;
      }

      const metTags = WEICK_TAGS.filter((tag) => metCriteria[tag]);

      const newCafe: Cafe = {
        id: `${slugify(name)}-${Date.now().toString(36)}`,
        name: name.trim(),
        neighborhood: geocoded.neighborhood,
        address: address.trim(),
        longitude: geocoded.longitude,
        latitude: geocoded.latitude,
        rating: metTags.length,
        metCriteria: metTags,
        distinguished: bonusMode === "bonus",
        distinguishedReason: bonusMode === "bonus" ? reason.trim() : undefined,
        detriment: bonusMode === "detriment",
        detrimentReason: bonusMode === "detriment" ? reason.trim() : undefined,
        description: description.trim() || undefined,
        reviews: [],
      };

      await onSubmit(newCafe);
      resetForm();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-entry-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title" id="add-entry-title">
            Add a Cafe
          </h2>
          <button
            type="button"
            className="modal-close-button"
            onClick={handleClose}
            aria-label="Close"
          >
            x
          </button>
        </div>
        <form className="entry-form" onSubmit={handleSubmit}>
          <label className="entry-field">
            <span>Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label className="entry-field">
            <span>Address</span>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Main St, Atlanta, GA"
              required
            />
          </label>

          <CriteriaButtons
            metCriteria={metCriteria}
            onToggleCriterion={toggleCriterion}
          />

          <BonusDetrimentFields
            bonusMode={bonusMode}
            onBonusModeChange={setBonusMode}
            reason={reason}
            onReasonChange={setReason}
          />

          <label className="entry-field">
            <span>Description (optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="modal-cancel"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="login-submit"
              disabled={submitting}
            >
              {submitting ? "Adding…" : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
