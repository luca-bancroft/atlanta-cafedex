type StarRatingProps = {
  rating: number;
  size?: string;
  showValue?: boolean;
};

export default function StarRating({
  rating,
  size = "1rem",
  showValue = true,
}: StarRatingProps) {
  const fillPercent = Math.max(0, Math.min(1, rating / 5)) * 100;

  return (
    <span className="star-rating" aria-label={`${rating} out of 5 stars`}>
      <span className="star-rating-stars" style={{ fontSize: size }}>
        <span className="star-rating-track">★★★★★</span>
        <span
          className="star-rating-fill"
          style={{ width: `${fillPercent}%` }}
        >
          ★★★★★
        </span>
      </span>
      {showValue && (
        <span className="star-rating-value">{rating.toFixed(1)}</span>
      )}
    </span>
  );
}
