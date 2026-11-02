import mongoose, { Schema, models, model } from "mongoose";

const opts = { timestamps: true };

const PackageSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 }, // per person, INR
    days: { type: Number, required: true, min: 1 },
    nights: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    included: { type: [String], default: [] },
    excluded: { type: [String], default: [] },
    images: { type: [String], default: [] }, // image links (Cloudinary / Unsplash / any https URL)
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  opts
);
PackageSchema.index({ active: 1, featured: -1, createdAt: -1 });
PackageSchema.index({ title: "text", destination: "text" });

const VehicleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, default: "Car" }, // Car, SUV, Tempo Traveller, Bus...
    seats: { type: Number, default: 4 },
    pricePerDay: { type: Number, required: true, min: 0 },
    pricePerKm: { type: Number, default: 0 },
    description: { type: String, default: "" },
    features: { type: [String], default: [] },
    images: { type: [String], default: [] },
    active: { type: Boolean, default: true },
  },
  opts
);
VehicleSchema.index({ active: 1, createdAt: -1 });

const OfferSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, default: "" },
    badge: { type: String, default: "Hot" }, // Hot, New, Limited, News
    image: { type: String, default: "" },
    link: { type: String, default: "" },
    validTill: { type: Date },
    active: { type: Boolean, default: true },
  },
  opts
);
OfferSchema.index({ active: 1, createdAt: -1 });

const BookingSchema = new Schema(
  {
    kind: { type: String, enum: ["package", "vehicle"], required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
    itemTitle: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    travelDate: { type: Date },
    travellers: { type: Number, default: 1 },
    message: { type: String, default: "" },
    status: { type: String, enum: ["new", "contacted", "confirmed", "cancelled"], default: "new" },
  },
  opts
);
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ status: 1, createdAt: -1 });

const ProfileSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: String,
    phone: { type: String, default: "" },
  },
  opts
);

export const Package = models.Package || model("Package", PackageSchema);
export const Vehicle = models.Vehicle || model("Vehicle", VehicleSchema);
export const Offer = models.Offer || model("Offer", OfferSchema);
export const Booking = models.Booking || model("Booking", BookingSchema);
export const Profile = models.Profile || model("Profile", ProfileSchema);

export type ResourceKey = "packages" | "vehicles" | "offers";
export const resourceModels: Record<ResourceKey, mongoose.Model<any>> = {
  packages: Package,
  vehicles: Vehicle,
  offers: Offer,
};
