export const BED_TYPES = ["King", "Queen", "Twin", "Double", "Bunk", "Single"];
export const VIEWS = ["Ocean View", "City View", "Garden View", "Pool View", "No View"];
export const ROOM_STATUSES = ["Active", "Inactive", "Archived"];

export let ROOMS = [
  { id: "RM-2001", propertyId: "PROP-1001", name: "Deluxe Ocean King", description: "Spacious king room with private balcony overlooking the bay.", occupancy: 2, maxAdults: 2, maxChildren: 1, bedType: "King", view: "Ocean View", smoking: false, status: "Active" },
  { id: "RM-2002", propertyId: "PROP-1001", name: "Garden Twin Room", description: "Ground floor twin room opening onto tropical gardens.", occupancy: 2, maxAdults: 2, maxChildren: 0, bedType: "Twin", view: "Garden View", smoking: false, status: "Active" },
  { id: "RM-2003", propertyId: "PROP-1001", name: "Presidential Suite", description: "Top-floor suite with panoramic ocean views and private plunge pool.", occupancy: 4, maxAdults: 3, maxChildren: 2, bedType: "King", view: "Ocean View", smoking: false, status: "Active" },
  { id: "RM-2004", propertyId: "PROP-1002", name: "Executive City Queen", description: "Modern queen room with skyline views, ideal for business travel.", occupancy: 2, maxAdults: 2, maxChildren: 0, bedType: "Queen", view: "City View", smoking: false, status: "Active" },
  { id: "RM-2005", propertyId: "PROP-1002", name: "Classic Double Room", description: "Comfortable double room close to the executive lounge.", occupancy: 2, maxAdults: 2, maxChildren: 1, bedType: "Double", view: "City View", smoking: true, status: "Active" },
  { id: "RM-2006", propertyId: "PROP-1003", name: "Private Pool Villa", description: "Standalone villa with private infinity pool and outdoor lounge.", occupancy: 4, maxAdults: 4, maxChildren: 2, bedType: "King", view: "Pool View", smoking: false, status: "Active" },
  { id: "RM-2007", propertyId: "PROP-1005", name: "Cinnamon Studio", description: "Compact studio with bespoke local furnishings.", occupancy: 2, maxAdults: 2, maxChildren: 0, bedType: "Queen", view: "City View", smoking: false, status: "Inactive" },
];

export function nextRoomId() {
  const nums = ROOMS.map((r) => Number(r.id.split("-")[1]) || 2000);
  return `RM-${Math.max(...nums, 2000) + 1}`;
}
