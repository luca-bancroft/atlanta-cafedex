"use client";

import { useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import CafeMap, { type FocusRequest } from "./Map";
import Navbar from "./Navbar";
import AddEntryModal from "./AddEntryModal";
import AddReviewModal, { type ReviewSubmission } from "./AddReviewModal";
import WeickIndexRating from "./WeickIndexRating";
import StarRating from "./StarRating";
import ExpandableText from "./ExpandableText";
import type { Cafe, Review } from "../data/cafes";
import { WEICK_TAGS } from "../lib/weick";

type HomeClientProps = {
  initialCafes: Cafe[];
  dbUnavailable?: boolean;
};

async function parseErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  const body = await response.json().catch(() => null);
  return body?.error ?? fallback;
}

export default function HomeClient({
  initialCafes,
  dbUnavailable = false,
}: HomeClientProps) {
  const { data: session, status } = useSession();
  const username = session?.user?.username;
  const [cafes, setCafes] = useState<Cafe[]>(initialCafes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [editingCafe, setEditingCafe] = useState<Cafe | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const focusRequestId = useRef(0);

  const selected = useMemo(
    () => cafes.find((cafe) => cafe.id === selectedId) ?? null,
    [cafes, selectedId]
  );

  const communityRating = useMemo(() => {
    if (!selected || selected.reviews.length === 0) return null;
    const total = selected.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    return total / selected.reviews.length;
  }, [selected]);

  const filteredCafes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return cafes.filter(
      (cafe) =>
        cafe.name.toLowerCase().includes(q) ||
        cafe.neighborhood.toLowerCase().includes(q)
    );
  }, [cafes, query]);

  const focusOn = (cafe: Cafe) => {
    focusRequestId.current += 1;
    setFocusRequest({ cafe, requestId: focusRequestId.current });
  };

  const handleSelect = (cafe: Cafe | null) => {
    setSelectedId(cafe?.id ?? null);
  };

  const handleSelectFromSearch = (cafe: Cafe) => {
    setSelectedId(cafe.id);
    focusOn(cafe);
    setQuery("");
  };

  const openAddEntry = () => {
    setEditingCafe(null);
    setIsAddEntryOpen(true);
  };

  const openEditEntry = (cafe: Cafe) => {
    setEditingCafe(cafe);
    setIsAddEntryOpen(true);
  };

  const openAddReview = () => {
    setEditingReview(null);
    setIsAddReviewOpen(true);
  };

  const openEditReview = (review: Review) => {
    setEditingReview(review);
    setIsAddReviewOpen(true);
  };

  const handleAddCafe = async (cafe: Cafe) => {
    const response = await fetch("/api/cafes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cafe),
    });
    if (!response.ok) {
      throw new Error(await parseErrorMessage(response, "Failed to save the cafe."));
    }
    const saved: Cafe = await response.json();

    setCafes((prev) => [...prev, saved]);
    setSelectedId(saved.id);
    focusOn(saved);
  };

  const handleUpdateCafe = async (cafe: Cafe) => {
    const response = await fetch(`/api/cafes/${cafe.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cafe),
    });
    if (!response.ok) {
      throw new Error(
        await parseErrorMessage(response, "Failed to update the cafe.")
      );
    }
    const updated: Cafe = await response.json();
    setCafes((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCafe = async (cafeId: string) => {
    if (!window.confirm("Delete this cafe? This can't be undone.")) return;

    const response = await fetch(`/api/cafes/${cafeId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      alert(await parseErrorMessage(response, "Failed to delete the cafe."));
      return;
    }

    setCafes((prev) => prev.filter((c) => c.id !== cafeId));
    setSelectedId((current) => (current === cafeId ? null : current));
  };

  const handleAddReview = async (cafeId: string, review: ReviewSubmission) => {
    const response = await fetch(`/api/cafes/${cafeId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review),
    });
    if (!response.ok) {
      throw new Error(
        await parseErrorMessage(response, "Failed to save the review.")
      );
    }
    const updatedCafe: Cafe = await response.json();
    setCafes((prev) =>
      prev.map((cafe) => (cafe.id === cafeId ? updatedCafe : cafe))
    );
  };

  const handleUpdateReview = async (
    cafeId: string,
    reviewId: string,
    review: ReviewSubmission
  ) => {
    const response = await fetch(`/api/cafes/${cafeId}/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review),
    });
    if (!response.ok) {
      throw new Error(
        await parseErrorMessage(response, "Failed to update the review.")
      );
    }
    const updatedCafe: Cafe = await response.json();
    setCafes((prev) =>
      prev.map((cafe) => (cafe.id === cafeId ? updatedCafe : cafe))
    );
  };

  const handleDeleteReview = async (cafeId: string, reviewId: string) => {
    if (!window.confirm("Delete this review? This can't be undone.")) return;

    const response = await fetch(`/api/cafes/${cafeId}/reviews/${reviewId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      alert(await parseErrorMessage(response, "Failed to delete the review."));
      return;
    }
    const updatedCafe: Cafe = await response.json();
    setCafes((prev) =>
      prev.map((cafe) => (cafe.id === cafeId ? updatedCafe : cafe))
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar onAddEntry={openAddEntry} />
      <div className="flex-1 flex overflow-hidden main-layout">
        <aside className="sidebar">
          {dbUnavailable && (
            <p className="db-warning">The server is not responding.</p>
          )}
          <div className="search-box">
            <input
              type="search"
              className="search-input"
              placeholder="Search cafes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query.trim() !== "" && (
              <ul className="search-results">
                {filteredCafes.length > 0 ? (
                  filteredCafes.map((cafe) => (
                    <li key={cafe.id}>
                      <button
                        type="button"
                        className="search-result"
                        onClick={() => handleSelectFromSearch(cafe)}
                      >
                        <span className="search-result-name">
                          {cafe.name}
                        </span>
                        <span className="search-result-neighborhood">
                          {cafe.neighborhood}
                        </span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="search-empty">No cafes found.</li>
                )}
              </ul>
            )}
          </div>

          <div className="sidebar-box">
            <h2 className="sidebar-box-title">Cafe Details</h2>
            {selected ? (
              <div className="cafe-details">
                <div className="cafe-details-header">
                  <span className="cafe-details-name">{selected.name}</span>
                  <span className="cafe-details-neighborhood">
                    {selected.neighborhood}
                  </span>
                  {selected.address && (
                    <span className="cafe-details-address">
                      {selected.address}
                    </span>
                  )}
                  {username && selected.createdBy === username && (
                    <div className="owner-actions">
                      <button
                        type="button"
                        className="owner-action-button"
                        onClick={() => openEditEntry(selected)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="owner-action-button danger"
                        onClick={() => handleDeleteCafe(selected.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                <WeickIndexRating
                  rating={selected.rating}
                  metCriteria={selected.metCriteria}
                  distinguished={selected.distinguished}
                  distinguishedReason={selected.distinguishedReason}
                  detriment={selected.detriment}
                  detrimentReason={selected.detrimentReason}
                />
                {communityRating !== null && (
                  <div className="community-rating">
                    <span className="community-rating-label">
                      Community Rating
                    </span>
                    <StarRating rating={communityRating} size="0.85rem" />
                  </div>
                )}
                {selected.description && (
                  <ExpandableText
                    text={selected.description}
                    className="cafe-details-description"
                  />
                )}
                <div className="cafe-details-reviews">
                  <h3 className="cafe-details-reviews-title">Reviews</h3>
                  {selected.reviews.length > 0 ? (
                    <ul className="review-list">
                      {selected.reviews.map((review) => (
                        <li key={review.id} className="review-item">
                          <WeickIndexRating
                            rating={review.rating}
                            metCriteria={review.metCriteria}
                            size="0.75rem"
                            showLabel={false}
                            showValue={false}
                            showReasons={false}
                          />
                          <ExpandableText
                            text={review.text}
                            className="review-text"
                            maxLength={140}
                            quote
                          />
                          <div className="review-footer">
                            <span className="review-author">
                              — {review.author}
                            </span>
                            {username &&
                              review.authorUsername === username && (
                                <div className="owner-actions">
                                  <button
                                    type="button"
                                    className="owner-action-button"
                                    onClick={() => openEditReview(review)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="owner-action-button danger"
                                    onClick={() =>
                                      handleDeleteReview(
                                        selected.id,
                                        review.id
                                      )
                                    }
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="sidebar-box-text">No reviews yet.</p>
                  )}
                  {status === "authenticated" && (
                    <button
                      type="button"
                      className="add-review-button"
                      onClick={openAddReview}
                    >
                      + Add Review
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="sidebar-box-text">
                Click a cafe marker on the map, or search above, to see its
                details here.
              </p>
            )}
          </div>
          <div className="sidebar-box">
            <h2 className="sidebar-box-title">The Weick Index</h2>
            <p className="sidebar-box-text">
              A 5 point community ranking assessing a cafe's whimsy. An
              additional star is added for distinguishment and a minus sign
              for a clear detriment.
            </p>
            <ul className="weick-tag-list">
              {WEICK_TAGS.map((tag) => (
                <li key={tag} className="weick-tag">
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="flex-1 map-panel">
          <CafeMap
            cafes={cafes}
            selected={selected}
            onSelect={handleSelect}
            focusRequest={focusRequest}
          />
        </div>
      </div>
      <AddEntryModal
        key={editingCafe?.id ?? "new-entry"}
        isOpen={isAddEntryOpen}
        initialCafe={editingCafe ?? undefined}
        onClose={() => {
          setIsAddEntryOpen(false);
          setEditingCafe(null);
        }}
        onSubmit={editingCafe ? handleUpdateCafe : handleAddCafe}
      />
      {selected && (
        <AddReviewModal
          key={editingReview?.id ?? "new-review"}
          isOpen={isAddReviewOpen}
          cafeName={selected.name}
          initialReview={editingReview ?? undefined}
          onClose={() => {
            setIsAddReviewOpen(false);
            setEditingReview(null);
          }}
          onSubmit={
            editingReview
              ? (review) =>
                  handleUpdateReview(selected.id, editingReview.id, review)
              : (review) => handleAddReview(selected.id, review)
          }
        />
      )}
    </div>
  );
}
