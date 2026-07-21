import {
  DoorOpen, Link2, ArrowUpRight, ArrowDownRight, Accessibility, PawPrint, Cigarette, Ban,
  Droplet, Hand, Bell, Ear, Building2, Trees, Waves, Umbrella, Mountain, Flag, MapPin,
  ArrowDown, ArrowUp, VolumeX, Sun, Bath, ChefHat, UtensilsCrossed, Sofa, Laptop, Tv,
  Coffee, Wine, Lock, Zap, Package, RotateCw, Flame, Crown, Briefcase, Heart, Users,
  User, CalendarDays, Gem, Users2, Star, Presentation, Sparkles,
  Home, Square, Building, Layers, LayoutGrid, BedDouble, Check,
} from "lucide-react";

export const DEFAULT_FEATURE_ICON = Sparkles;

export const ROOM_FEATURE_ICONS = {
  // Room Options
  "Connecting Room": DoorOpen,
  "Adjoining Room": DoorOpen,
  "Adjacent Room": Link2,
  "Corner Room": ArrowUpRight,
  "Accessible Room": Accessibility,
  "Pet Friendly Room": PawPrint,
  "Smoking": Cigarette,
  "Non-Smoking": Ban,

  // Accessibility
  "Wheelchair Accessible": Accessibility,
  "Roll-in Shower": Droplet,
  "Grab Rails": Hand,
  "Visual Alarm": Bell,
  "Hearing Assistance": Ear,

  // Room Views
  "City": Building2,
  "Garden": Trees,
  "Pool": Waves,
  "Beach": Umbrella,
  "Ocean": Waves,
  "Sea": Waves,
  "Lake": Droplet,
  "River": Waves,
  "Mountain": Mountain,
  "Forest": Trees,
  "Golf Course": Flag,
  "Courtyard": Trees,

  // Room Positions
  "Ground Floor": ArrowDown,
  "High Floor": ArrowUp,
  "Near Elevator": MapPin,
  "Quiet Zone": VolumeX,
  "Corner Wing": ArrowDownRight,

  // Amenities
  "Balcony": DoorOpen,
  "Terrace": Sun,
  "Jacuzzi": Waves,
  "Bathtub": Bath,
  "Walk-in Shower": Droplet,
  "Kitchenette": ChefHat,
  "Dining Area": UtensilsCrossed,
  "Living Room": Sofa,
  "Workspace": Laptop,
  "Smart TV": Tv,
  "Coffee Machine": Coffee,
  "Mini Bar": Wine,
  "Safe": Lock,
  "Microwave": Zap,
  "Refrigerator": Package,
  "Washing Machine": RotateCw,
  "Private Pool": Waves,
  "Fireplace": Flame,
  "Club Lounge Access": Crown,

  // Best Suited For
  "Business Travellers": Briefcase,
  "Couples": Heart,
  "Families": Users,
  "Solo Travellers": User,
  "Long Stay Guests": CalendarDays,
  "Honeymoon": Heart,
  "Corporate": Building2,
  "Luxury Guests": Gem,
  "Groups": Users2,
  "VIP Guests": Star,
  "Accessible Stay": Accessibility,
  "Pet Owners": PawPrint,

  // Suite Features
  "Separate Living Room": Sofa,
  "Dining Room": UtensilsCrossed,
  "Butler Service": Bell,
  "Kitchen": ChefHat,
  "Pantry": Package,
  "Private Entrance": DoorOpen,
  "Private Elevator": ArrowUp,
  "Meeting Area": Presentation,

  // Room Types (Classification)
  "Standard": Home,
  "Superior": Star,
  "Deluxe": Gem,
  "Premium Deluxe": Gem,
  "Executive": Briefcase,
  "Studio": Square,
  "Junior Suite": Crown,
  "Suite": Crown,
  "Executive Suite": Crown,
  "Master Suite": Crown,
  "Presidential Suite": Crown,
  "Penthouse Suite": Building2,
  "Villa Suite": Home,
  "Apartment Suite": Building,
  "Duplex Suite": Layers,

  // Room Layouts
  "Open Plan": LayoutGrid,
  "One Bedroom": BedDouble,
  "Two Bedroom": BedDouble,
  "Three Bedroom": BedDouble,
  "Loft": Home,
  "Duplex": Layers,
  "Connecting Layout": DoorOpen,

  // Occupancy Based
  "Single": User,
  "Double": Users,
  "Twin": Users2,
  "Triple": Users2,
  "Quad": Users2,
  "Family": Users,
  "Dormitory": Building,

  // Bed Configuration
  "Single Bed": BedDouble,
  "Twin Beds": BedDouble,
  "Double Bed": BedDouble,
  "Queen Bed": BedDouble,
  "King Bed": BedDouble,
  "California King": BedDouble,
  "Bunk Beds": Layers,
  "Sofa Bed": Sofa,
  "Murphy Bed": DoorOpen,

  // Yes / No toggles
  "Yes": Check,
  "No": Ban,
};

export function featureIcon(label) {
  return ROOM_FEATURE_ICONS[label] || DEFAULT_FEATURE_ICON;
}
