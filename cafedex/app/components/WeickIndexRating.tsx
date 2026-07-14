import StarRating from "./StarRating";
import { WEICK_TAGS, type WeickTag } from "../lib/weick";

type WeickIndexRatingProps = {
  rating: number;
  metCriteria?: WeickTag[];
  distinguished?: boolean;
  distinguishedReason?: string;
  detriment?: boolean;
  detrimentReason?: string;
  size?: string;
  showLabel?: boolean;
  showValue?: boolean;
  showReasons?: boolean;
};

export default function WeickIndexRating({
  rating,
  metCriteria,
  distinguished = false,
  distinguishedReason,
  detriment = false,
  detrimentReason,
  size = "1rem",
  showLabel = true,
  showValue = true,
  showReasons = true,
}: WeickIndexRatingProps) {
  const metSet = new Set(metCriteria ?? []);

  return (
    <div className="weick-rating">
      {showLabel && <span className="weick-rating-label">Weick Index</span>}
      <div className="weick-rating-row">
        <span
          className="weick-stars-hover"
          tabIndex={metCriteria ? 0 : undefined}
        >
          <StarRating rating={rating} size={size} showValue={showValue} />
          {metCriteria && (
            <div className="weick-criteria-tooltip" role="tooltip">
              <span className="weick-criteria-tooltip-title">
                Criteria met
              </span>
              <ul className="weick-criteria-list">
                {WEICK_TAGS.map((tag) => (
                  <li
                    key={tag}
                    className={`weick-criteria-item${
                      metSet.has(tag) ? " met" : " unmet"
                    }`}
                  >
                    <span className="weick-criteria-icon" aria-hidden="true">
                      {metSet.has(tag) ? "✓" : "✕"}
                    </span>
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </span>
        {distinguished && (
          <span
            className="weick-badge weick-badge-bonus"
            title={
              distinguishedReason ||
              "Bonus star: a clear point of distinguishment"
            }
          >
            ★+
          </span>
        )}
        {detriment && (
          <span
            className="weick-badge weick-badge-detriment"
            title={detrimentReason || "Marked down: a clear detriment"}
          >
            -
          </span>
        )}
      </div>
      {showReasons && distinguished && distinguishedReason && (
        <p className="weick-reason weick-reason-bonus">
          ★+ {distinguishedReason}
        </p>
      )}
      {showReasons && detriment && detrimentReason && (
        <p className="weick-reason weick-reason-detriment">
          - {detrimentReason}
        </p>
      )}
    </div>
  );
}
