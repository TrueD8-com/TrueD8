import { z } from "zod";

// Profile validation schema
export const profileSchema = z.object({
  profileName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  profileLastName: z
    .string()
    .max(50, "Last name must be less than 50 characters")
    .optional()
    .or(z.literal("")),
  profileUsername: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional()
    .or(z.literal("")),
  profileBio: z
    .string()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  profileGender: z.enum(["male", "female", "non-binary", "other"], {
    message: "Please select a gender",
  }),
  profileShowMe: z
    .array(z.string())
    .min(1, "Please select at least one preference")
    .max(3, "Maximum 3 preferences allowed"),
  profileInterests: z
    .array(z.string())
    .max(10, "Maximum 10 interests allowed")
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Preferences/Discovery validation schema
export const preferencesSchema = z.object({
  discoveryDistanceKm: z
    .number()
    .min(1, "Distance must be at least 1 km")
    .max(100, "Distance must be less than 100 km"),
  discoveryAgeMin: z
    .number()
    .min(18, "Minimum age must be at least 18")
    .max(99, "Minimum age must be less than 100"),
  discoveryAgeMax: z
    .number()
    .min(18, "Maximum age must be at least 18")
    .max(99, "Maximum age must be less than 100"),
  discoveryVisible: z.boolean().optional(),
  discoveryGlobal: z.boolean().optional(),
}).refine((data) => data.discoveryAgeMax >= data.discoveryAgeMin, {
  message: "Maximum age must be greater than or equal to minimum age",
  path: ["discoveryAgeMax"],
});

export type PreferencesFormData = z.infer<typeof preferencesSchema>;

// Combined profile + preferences schema
export const fullProfileSchema = profileSchema.merge(preferencesSchema);

export type FullProfileFormData = z.infer<typeof fullProfileSchema>;

// Photo upload validation
export const photoUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine(
      (file) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type),
      "Only JPEG, PNG, and WebP images are allowed"
    ),
});

// Common interest categories for the selector
export const INTEREST_CATEGORIES = {
  sports: [
    "Running",
    "Yoga",
    "Gym",
    "Swimming",
    "Cycling",
    "Hiking",
    "Basketball",
    "Soccer",
    "Tennis",
    "Martial Arts",
  ],
  arts: [
    "Photography",
    "Painting",
    "Drawing",
    "Writing",
    "Music",
    "Dancing",
    "Theater",
    "Film",
    "Design",
    "Crafts",
  ],
  entertainment: [
    "Movies",
    "TV Shows",
    "Gaming",
    "Reading",
    "Podcasts",
    "Concerts",
    "Festivals",
    "Comedy",
    "Anime",
    "Netflix",
  ],
  food: [
    "Cooking",
    "Baking",
    "Wine Tasting",
    "Coffee",
    "Foodie",
    "Vegan",
    "Vegetarian",
    "Street Food",
    "Fine Dining",
    "BBQ",
  ],
  outdoors: [
    "Travel",
    "Camping",
    "Beach",
    "Mountains",
    "Surfing",
    "Skiing",
    "Rock Climbing",
    "Fishing",
    "Gardening",
    "Nature",
  ],
  lifestyle: [
    "Fashion",
    "Beauty",
    "Meditation",
    "Wellness",
    "Volunteering",
    "Environmentalism",
    "DIY",
    "Tech",
    "Crypto",
    "NFTs",
  ],
  social: [
    "Nightlife",
    "Bars",
    "Coffee Shops",
    "Brunch",
    "Board Games",
    "Karaoke",
    "Clubbing",
    "Wine Bars",
    "Trivia",
    "Networking",
  ],
};

// Flatten all interests for easy access
export const ALL_INTERESTS = Object.values(INTEREST_CATEGORIES).flat();

// Gender options
export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "other", label: "Other" },
] as const;

// Show me options
export const SHOW_ME_OPTIONS = [
  { value: "male", label: "Men" },
  { value: "female", label: "Women" },
  { value: "non-binary", label: "Non-binary" },
  { value: "everyone", label: "Everyone" },
] as const;
