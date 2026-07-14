import type { WeickTag } from "../lib/weick";

export type Review = {
  author: string;
  text: string;
  rating: number;
  metCriteria: WeickTag[];
};

export type Cafe = {
  id: string;
  name: string;
  neighborhood: string;
  address?: string;
  longitude: number;
  latitude: number;
  rating: number;
  metCriteria?: WeickTag[];
  distinguished?: boolean;
  distinguishedReason?: string;
  detriment?: boolean;
  detrimentReason?: string;
  description?: string;
  reviews: Review[];
};
