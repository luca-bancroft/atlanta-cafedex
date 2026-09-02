"use client";

type StarRatingInputProps = {
  value: number;
  onChange: (value: number) => void;
};

const STARS = [1, 2, 3, 4, 5];

export default function StarRatingInput({
  value,
  onChange,
}: StarRatingInputProps) {
  return (
    <div className="star-rating-input" role="radiogroup" aria-label="Rating">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          className={`star-rating-input-star${star <= value ? " filled" : ""}`}
          onClick={() => onChange(star)}
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
