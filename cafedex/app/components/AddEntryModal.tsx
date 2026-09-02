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
  initialCafe?: Cafe;
};

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "cafe";
}

function criteriaFromList(list: WeickTag[] | undefined): Record<WeickTag, boolean> {
  const empty = createEmptyCriteria();
  for (const tag of list ?? []) {
    empty[tag] = true;
  }
  return empty;
}

function initialBonusMode(cafe: Cafe | undefined): BonusMode {
  if (cafe?.distinguished) return "bonus";
  if (cafe?.detriment) return "detriment";
  return "none";
}

export default function AddEntryModal({
  isOpen,
  onClose,
  onSubmit,
  initialCafe,
}: AddEntryModalProps) {
  const isEditing = Boolean(initialCafe);
  const [name, setName] = useState(initialCafe?.name ?? "");
  const [address, setAddress] = useState(initialCafe?.address ?? "");
  const [metCriteria, setMetCriteria] = useState<Record<WeickTag, boolean>>(
    () => criteriaFromList(initialCafe?.metCriteria)
  );
  const [bonusMode, setBonusMode] = useState<BonusMode>(() =>
    initialBonusMode(initialCafe)
  );
  const [reason, setReason] = useState(
    initialCafe?.distinguishedReason ?? initialCafe?.detrimentReason ?? ""
  );
  const [description, setDescription] = useState(
    initialCafe?.description ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useModalBehavior(isOpen, onClose);

  if (!isOpen) return null;

  const resetForm = () => {
    setName(initialCafe?.name ?? "");
    setAddress(initialCafe?.address ?? "");
    setMetCriteria(criteriaFromList(initialCafe?.metCriteria));
    setBonusMode(initialBonusMode(initialCafe));
    setReason(
      initialCafe?.distinguishedReason ?? initialCafe?.detrimentReason ?? ""
    );
    setDescription(initialCafe?.description ?? "");
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

    if (!name.trim() || (!isEditing && !address.trim())) {
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
      const metTags = WEICK_TAGS.filter((tag) => metCriteria[tag]);

      let cafe: Cafe;
      if (initialCafe) {
        cafe = {
          ...initialCafe,
          name: name.trim(),
          rating: metTags.length,
          metCriteria: metTags,
          distinguished: bonusMode === "bonus",
          distinguishedReason:
            bonusMode === "bonus" ? reason.trim() : undefined,
          detriment: bonusMode === "detriment",
          detrimentReason:
            bonusMode === "detriment" ? reason.trim() : undefined,
          description: description.trim() || undefined,
        };
      } else {
        const geocoded = await geocodeAddress(address);
        if (!geocoded) {
          setError("Couldn't find that address. Try refining it.");
          return;
        }

        cafe = {
          id: `${slugify(name)}-${Date.now().toString(36)}`,
          name: name.trim(),
          neighborhood: geocoded.neighborhood,
          address: address.trim(),
          longitude: geocoded.longitude,
          latitude: geocoded.latitude,
          rating: metTags.length,
          metCriteria: metTags,
          distinguished: bonusMode === "bonus",
          distinguishedReason:
            bonusMode === "bonus" ? reason.trim() : undefined,
          detriment: bonusMode === "detriment",
          detrimentReason:
            bonusMode === "detriment" ? reason.trim() : undefined,
          description: description.trim() || undefined,
          reviews: [],
        };
      }

      await onSubmit(cafe);
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
            {isEditing ? "Edit Cafe" : "Add a Cafe"}
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
            <span>Address{isEditing && " (can't be changed)"}</span>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 123 Main St, Atlanta, GA"
              disabled={isEditing}
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
              {submitting
                ? "Saving…"
                : isEditing
                  ? "Save Changes"
                  : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
