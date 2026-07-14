"use client";

import { useState, type FormEvent } from "react";
import { WEICK_TAGS, type WeickTag } from "../lib/weick";
import { useModalBehavior } from "../lib/useModalBehavior";
import { CriteriaButtons, createEmptyCriteria } from "./WeickCriteriaFields";
import type { Review } from "../data/cafes";

type AddReviewModalProps = {
  isOpen: boolean;
  cafeName: string;
  authorName: string;
  onClose: () => void;
  onSubmit: (review: Review) => Promise<void>;
};

export default function AddReviewModal({
  isOpen,
  cafeName,
  authorName,
  onClose,
  onSubmit,
}: AddReviewModalProps) {
  const [text, setText] = useState("");
  const [metCriteria, setMetCriteria] = useState<Record<WeickTag, boolean>>(
    createEmptyCriteria
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useModalBehavior(isOpen, onClose);

  if (!isOpen) return null;

  const resetForm = () => {
    setText("");
    setMetCriteria(createEmptyCriteria());
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

    if (!text.trim()) {
      setError("Add a few words for your review.");
      return;
    }

    const metTags = WEICK_TAGS.filter((tag) => metCriteria[tag]);

    const review: Review = {
      author: authorName,
      text: text.trim(),
      rating: metTags.length,
      metCriteria: metTags,
    };

    setSubmitting(true);
    try {
      await onSubmit(review);
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
        aria-labelledby="add-review-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title" id="add-review-title">
            Review {cafeName}
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
            <span>Your review</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              required
            />
          </label>

          <CriteriaButtons
            metCriteria={metCriteria}
            onToggleCriterion={toggleCriterion}
          />

          {error && <p className="login-error">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="modal-cancel"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button type="submit" className="login-submit" disabled={submitting}>
              {submitting ? "Posting…" : "Post Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
