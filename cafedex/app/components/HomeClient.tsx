"use client";

import { useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import CafeMap, { type FocusRequest } from "./Map";
import Navbar from "./Navbar";
import AddEntryModal from "./AddEntryModal";
import AddReviewModal from "./AddReviewModal";
import WeickIndexRating from "./WeickIndexRating";
import StarRating from "./StarRating";
import ExpandableText from "./ExpandableText";
import type { Cafe, Review } from "../data/cafes";
import { WEICK_TAGS } from "../lib/weick";

type HomeClientProps = {
  initialCafes: Cafe[];
  dbUnavailable?: boolean;
};

export default function HomeClient({
  initialCafes,
  dbUnavailable = false,
}: HomeClientProps) {
  const { data: session, status } = useSession();
  const [cafes, setCafes] = useState<Cafe[]>(initialCafes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
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

  const handleAddCafe = async (cafe: Cafe) => {
    const response = await fetch("/api/cafes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cafe),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error ?? "Failed to save the cafe.");
    }
    const saved: Cafe = await response.json();

    setCafes((prev) => [...prev, saved]);
    setSelectedId(saved.id);
    focusOn(saved);
  };

  const handleAddReview = async (cafeId: string, review: Review) => {
    const response = await fetch(`/api/cafes/${cafeId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error ?? "Failed to save the review.");
    }
    const updatedCafe: Cafe = await response.json();

    setCafes((prev) =>
      prev.map((cafe) => (cafe.id === cafeId ? updatedCafe : cafe))
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar onAddEntry={() => setIsAddEntryOpen(true)} />
      <div className="flex-1 flex overflow-hidden">
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
                      {selected.reviews.map((review, index) => (
                        <li key={index} className="review-item">
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
                          <span className="review-author">
                            — {review.author}
                          </span>
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
                      onClick={() => setIsAddReviewOpen(true)}
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
        <div className="flex-1">
          <CafeMap
            cafes={cafes}
            selected={selected}
            onSelect={handleSelect}
            focusRequest={focusRequest}
          />
        </div>
      </div>
      <AddEntryModal
        isOpen={isAddEntryOpen}
        onClose={() => setIsAddEntryOpen(false)}
        onSubmit={handleAddCafe}
      />
      {selected && (
        <AddReviewModal
          isOpen={isAddReviewOpen}
          cafeName={selected.name}
          authorName={session?.user?.name ?? "Anonymous"}
          onClose={() => setIsAddReviewOpen(false)}
          onSubmit={(review) => handleAddReview(selected.id, review)}
        />
      )}
    </div>
  );
}
