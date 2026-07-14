"use client";

import { WEICK_TAGS, type WeickTag } from "../lib/weick";

export type BonusMode = "none" | "bonus" | "detriment";

export function createEmptyCriteria(): Record<WeickTag, boolean> {
  return WEICK_TAGS.reduce((acc, tag) => {
    acc[tag] = false;
    return acc;
  }, {} as Record<WeickTag, boolean>);
}

type CriteriaButtonsProps = {
  metCriteria: Record<WeickTag, boolean>;
  onToggleCriterion: (tag: WeickTag) => void;
};

export function CriteriaButtons({
  metCriteria,
  onToggleCriterion,
}: CriteriaButtonsProps) {
  return (
    <div className="entry-field">
      <span>Weick Index criteria met</span>
      <div className="criteria-buttons">
        {WEICK_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`criteria-button${metCriteria[tag] ? " active" : ""}`}
            onClick={() => onToggleCriterion(tag)}
            aria-pressed={metCriteria[tag]}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

type BonusDetrimentFieldsProps = {
  bonusMode: BonusMode;
  onBonusModeChange: (mode: BonusMode) => void;
  reason: string;
  onReasonChange: (value: string) => void;
};

export function BonusDetrimentFields({
  bonusMode,
  onBonusModeChange,
  reason,
  onReasonChange,
}: BonusDetrimentFieldsProps) {
  return (
    <div className="entry-field">
      <span>Bonus or detriment (optional)</span>
      <div className="bonus-detriment-group">
        <button
          type="button"
          className={`bonus-detriment-button bonus${
            bonusMode === "bonus" ? " active" : ""
          }`}
          onClick={() =>
            onBonusModeChange(bonusMode === "bonus" ? "none" : "bonus")
          }
          aria-pressed={bonusMode === "bonus"}
        >
          ★+ Bonus star
        </button>
        <button
          type="button"
          className={`bonus-detriment-button detriment${
            bonusMode === "detriment" ? " active" : ""
          }`}
          onClick={() =>
            onBonusModeChange(bonusMode === "detriment" ? "none" : "detriment")
          }
          aria-pressed={bonusMode === "detriment"}
        >
          - Detriment
        </button>
      </div>
      {bonusMode !== "none" && (
        <input
          type="text"
          className="reason-input"
          placeholder="Reason…"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
        />
      )}
    </div>
  );
}
