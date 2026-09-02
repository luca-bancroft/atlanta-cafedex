"use client";

import { useState, type FormEvent } from "react";
import { useModalBehavior } from "../lib/useModalBehavior";
import StarRatingInput from "./StarRatingInput";
import type { Review } from "../data/cafes";

export type ReviewSubmission = {
  text: string;
  rating: number;
};

type AddReviewModalProps = {
  isOpen: boolean;
  cafeName: string;
  onClose: () => void;
  onSubmit: (review: ReviewSubmission) => Promise<void>;
  initialReview?: Review;
};

export default function AddReviewModal({
  isOpen,
  cafeName,
  onClose,
  onSubmit,
  initialReview,
}: AddReviewModalProps) {
  const [text, setText] = useState(initialReview?.text ?? "");
  const [rating, setRating] = useState(initialReview?.rating ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = Boolean(initialReview);

  useModalBehavior(isOpen, onClose);

  if (!isOpen) return null;

  const resetForm = () => {
    setText(initialReview?.text ?? "");
    setRating(initialReview?.rating ?? 0);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!text.trim()) {
      setError("Add a few words for your review.");
      return;
    }
    if (rating < 1) {
      setError("Pick a star rating.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ text: text.trim(), rating });
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
            {isEditing ? "Edit Your Review" : `Review ${cafeName}`}
          </h2>
          <button
            type="button"
            className="modal-close-button"
            onClick={handleClose}
            aria-label="Close"
          >
            ×
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

          <div className="entry-field">
            <span>Rating</span>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>

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
                  : "Post Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
