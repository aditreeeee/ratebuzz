import { CalendarDays, Flame, CalendarClock, PartyPopper, Gift, Star, Sparkles } from "lucide-react";

const DEFAULT_ICON = Sparkles;

const RATE_SEASON_ICONS = {
  "Standard": CalendarDays,
  "Peak": Flame,
  "Weekend": CalendarClock,
  "Festival": PartyPopper,
  "Holiday": Gift,
  "Event Season": Star,
};

export function rateSeasonIcon(category) {
  return RATE_SEASON_ICONS[category] || DEFAULT_ICON;
}
