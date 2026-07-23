// Default-value shapes for the Configuration Settings sub-tabs, kept here (a
// plain, dependency-light module) rather than in each settings page file, so
// consumer forms (CompetitorForm, RoomMappingForm, RatePlanMappingForm,
// SourceConfigForm) that only need the constant don't transitively import
// each settings page's whole component tree (Card/Field/Select/etc).
import { MEAL_PLANS, CANCELLATION_POLICIES, RATE_PLAN_STATUSES } from "../mocks/ratePlans.js";
import { CURRENCIES } from "../mocks/properties.js";
import { MAPPING_TYPES } from "../mocks/competitors.js";

export const COMPETITOR_GENERAL_DEFAULTS = { defaultPriority: "Medium" };
export const ROOM_MAPPING_SETTINGS_DEFAULTS = { defaultMappingType: MAPPING_TYPES[0], confidenceThreshold: 70 };
export const RATE_PLAN_MAPPING_SETTINGS_DEFAULTS = { defaultMealPlan: MEAL_PLANS[0], defaultCurrency: CURRENCIES[0] };
export const SOURCE_SETTINGS_DEFAULTS = { defaultPriority: "Medium", requireHttps: true, flagDuplicates: true };
export const IMPORT_EXPORT_SETTINGS_DEFAULTS = { defaultFormat: "CSV", includeArchived: false, skipInvalidRows: true };
export const RATE_PLAN_DEFAULTS_SETTINGS = { cancellationPolicy: CANCELLATION_POLICIES[0], status: RATE_PLAN_STATUSES[0], priceRounding: "No Rounding" };
export const PRICE_ROUNDING_OPTIONS = ["No Rounding", "Nearest Whole Number", "Nearest 0.50"];
