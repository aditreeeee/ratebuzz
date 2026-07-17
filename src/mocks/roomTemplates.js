export const ROOM_TEMPLATES = [
  {
    key: "standard-king",
    label: "Standard King",
    values: { name: "Standard King", description: "Comfortable king room with essential amenities.", occupancy: 2, maxAdults: 2, maxChildren: 0, bedType: "King", view: "City View", smoking: false, status: "Active" },
  },
  {
    key: "deluxe-king",
    label: "Deluxe King",
    values: { name: "Deluxe King", description: "Upgraded king room with premium furnishings and extra space.", occupancy: 2, maxAdults: 2, maxChildren: 1, bedType: "King", view: "Ocean View", smoking: false, status: "Active" },
  },
  {
    key: "superior-twin",
    label: "Superior Twin",
    values: { name: "Superior Twin", description: "Twin-bed room ideal for colleagues or friends travelling together.", occupancy: 2, maxAdults: 2, maxChildren: 0, bedType: "Twin", view: "Garden View", smoking: false, status: "Active" },
  },
  {
    key: "executive-suite",
    label: "Executive Suite",
    values: { name: "Executive Suite", description: "Spacious suite with separate living area and executive lounge access.", occupancy: 3, maxAdults: 2, maxChildren: 2, bedType: "King", view: "City View", smoking: false, status: "Active" },
  },
  {
    key: "family-room",
    label: "Family Room",
    values: { name: "Family Room", description: "Generously sized room designed for families, with flexible bedding.", occupancy: 4, maxAdults: 2, maxChildren: 2, bedType: "Double", view: "Pool View", smoking: false, status: "Active" },
  },
];
