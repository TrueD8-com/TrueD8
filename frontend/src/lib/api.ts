const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.trued8.com";

export const getImageUrl = (imageType: string, imagePath: string, imageName: string) =>
  `${API_URL}/user/getImages/${imageType}/${imagePath}/${imageName}`;

export interface NonceResponse {
  nonce: string;
}

export interface LoginResponse {
  address: string;
  userId: string;
}

export interface AuthCheckResponse {
  isAuth: boolean;
  address?: string;
}

export interface Address {
  province?: string;
  city?: string;
  postalCode?: string;
  address?: string;
  district?: string;
  phone?: string;
}

export interface Premium {
  isActive?: boolean;
  tier?: string;
  expiresAt?: string;
  features?: string[];
}

export interface Verification {
  photoVerified?: boolean;
  verifiedAt?: string;
  idVerified?: boolean;
  phoneVerified?: boolean;
}

export interface Metrics {
  likesSent?: number;
  likesReceived?: number;
  matchesCount?: number;
  messagesCount?: number;
  favoritesCount?: number;
}

export interface UserResponse {
  _id?: string;
  name?: string;
  lastName?: string;
  username?: string;
  userType?: string;
  email?: string;
  phoneNumber?: string;
  address?: Address;
  birthdate?: string;
  gender?: string;
  showMe?: string[];
  bio?: string;
  interests?: string[];
  photos?: Array<{ url: string; isPrimary: boolean; uploadedAt: string }>;
  discovery?: {
    distanceKm?: number;
    ageMin?: number;
    ageMax?: number;
    visible?: boolean;
    global?: boolean;
  };
  location?: {
    type: string;
    coordinates: number[];
    updatedAt: string;
  };
  premium?: Premium;
  verification?: Verification;
  onboardingCompleted?: boolean;
  metrics?: Metrics;
  wallet?: {
    provider?: string;
    address?: string;
    connectedAt?: string;
  };
}

export interface UserProfile {
  _id: string;
  name?: string;
  lastName?: string;
  username?: string;
  gender?: string;
  birthdate?: string;
  bio?: string;
  interests?: string[];
  photos?: Array<{ url: string; isPrimary: boolean; uploadedAt: string }>;
  location?: {
    type: string;
    coordinates: number[];
  };
  discovery?: {
    distanceKm?: number;
    visible?: boolean;
  };
  premium?: Premium;
  verification?: Verification;
  metrics?: Metrics;
}

export interface Match {
  _id: string;
  userA: string;
  userB: string;
  createdAt: string;
  isActive: boolean;
}

export interface Like {
  _id: string;
  liker: string;
  likee: string;
  isSuperLike: boolean;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: string[];
  match: string;
  lastMessageAt?: string;
  isArchived?: boolean;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: string;
  recipient: string;
  type: string;
  text?: string;
  mediaUrl?: string;
  isRead: boolean;
  sentAt: string;
}

// Auth API
export const authApi = {
  async getNonce(): Promise<NonceResponse> {
    const response = await fetch(`${API_URL}/auth/siwe/nonce`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to get nonce");
    const data = await response.json();
    return data.data || data;
  },

  async login(message: string, signature: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/siwe/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ message, signature }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }
    const data = await response.json();
    return data.data || data;
  },

  async checkAuth(): Promise<AuthCheckResponse> {
    const response = await fetch(`${API_URL}/auth/siwe/auth`, {
      credentials: "include",
    });
    if (!response.ok) {
      return { isAuth: false };
    }
    const data = await response.json();
    return data.data || data;
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_URL}/auth/siwe/logout`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Logout failed");
  },

  async getMe(): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/user/getUserProfileInfo`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to get user data");
    const data = await response.json();
    return data.data || data;
  },
};

// Note: Session-based auth uses cookies, no need for token helpers

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface EditProfileResponse {
  name?: string;
  lastName?: string;
  mobilePhone?: string;
}

export interface PhotoUploadResponse {
  imagePath: string;
  imageExt: string;
}

export interface PhotoResponse {
  url: string;
  isPrimary: boolean;
  uploadedAt: string;
}

export interface AddressResponse {
  province?: string;
  city?: string;
  postalCode?: string;
  address?: string;
  district?: string;
  phone?: string;
}

export interface WalletResponse {
  provider: string;
  address: string;
  connectedAt: string;
}

export interface Favorite {
  _id: string;
  user: string;
  target: string;
  createdAt: string;
}

export interface AIPromptData {
  system: string;
  user_context: {
    profile: Record<string, unknown>;
    interactions: Record<string, unknown>;
    metrics: Metrics;
  };
  goal: string;
  constraints: string[];
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  type: "speed_dating" | "mixer" | "mystery_match" | "group_activity";
  date: string;
  time: string;
  location: {
    name: string;
    address: string;
    coordinates: number[];
  };
  capacity: number;
  attendees: number;
  price: number;
  image?: string;
  tags: string[];
  ageRange?: { min: number; max: number };
  organizer?: string;
  rsvpStatus?: "attending" | "interested" | "not_attending";
}

export interface EventRSVP {
  eventId: string;
  userId: string;
  status: "attending" | "interested" | "not_attending";
  ticketId?: string;
  createdAt: string;
}

// User/Profile API
export const userApi = {
  async editProfile(profileData: {
    profileName?: string;
    profileLastName?: string;
    profileUsername?: string;
    profileBirthdate?: string;
    profileBio?: string;
    profileGender?: string;
    profileShowMe?: string[];
    profileInterests?: string[];
    discoveryDistanceKm?: number;
    discoveryAgeMin?: number;
    discoveryAgeMax?: number;
    discoveryVisible?: boolean;
    discoveryGlobal?: boolean;
  }): Promise<ApiResponse<EditProfileResponse>> {
    const response = await fetch(`${API_URL}/user/editProfile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(profileData),
    });
    if (!response.ok) throw new Error("Failed to edit profile");
    return response.json();
  },

  async uploadPhoto(file: File): Promise<PhotoUploadResponse> {
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch(`${API_URL}/user/photos/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!response.ok) throw new Error("Failed to upload photo");
    const data: ApiResponse<PhotoUploadResponse> = await response.json();
    return data.data || (data as unknown as PhotoUploadResponse);
  },

  async addPhoto(
    imageName: string,
    isPrimary: boolean
  ): Promise<ApiResponse<PhotoResponse>> {
    const response = await fetch(`${API_URL}/user/photos/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ imageName, isPrimary }),
    });
    if (!response.ok) throw new Error("Failed to add photo");
    return response.json();
  },

  async setPrimaryPhoto(url: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/user/photos/setPrimary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ url }),
    });
    if (!response.ok) throw new Error("Failed to set primary photo");
    return response.json();
  },

  async removePhoto(url: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/user/photos/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ url }),
    });
    if (!response.ok) throw new Error("Failed to remove photo");
    return response.json();
  },

  async setAddress(addressData: {
    provinceOp?: string;
    cityOp?: string;
    postalCodeOp?: string;
    addressOp?: string;
    districtOp?: string;
    phoneOp?: string;
    coordinates?: [number, number];
  }): Promise<ApiResponse<AddressResponse>> {
    const response = await fetch(`${API_URL}/user/setNewAddress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(addressData),
    });
    if (!response.ok) throw new Error("Failed to set address");
    return response.json();
  },

  async changePassword(
    password: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/user/changePassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ password, newPassword }),
    });
    if (!response.ok) throw new Error("Failed to change password");
    return response.json();
  },

  async connectWallet(
    provider: string,
    address: string
  ): Promise<ApiResponse<WalletResponse>> {
    const response = await fetch(`${API_URL}/user/wallet/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ provider, address }),
    });
    if (!response.ok) throw new Error("Failed to connect wallet");
    return response.json();
  },

  async disconnectWallet(): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/user/wallet/disconnect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to disconnect wallet");
    return response.json();
  },

  async uploadPhoto(file: File): Promise<PhotoUploadResponse> {
    const fd = new FormData();
    fd.append("photo", file);
    const response = await fetch(`${API_URL}/user/photos/upload`, {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    if (!response.ok) throw new Error("Failed to upload photo");
    const data = await response.json();
    return data.data || data;
  },

  async addPhoto(imagePath: string, imageExt: string): Promise<PhotoResponse> {
    const response = await fetch(`${API_URL}/user/photos/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ imagePath, imageExt }),
    });
    if (!response.ok) throw new Error("Failed to add photo");
    const data = await response.json();
    return data.data || data;
  },

  async setPrimaryPhoto(photoUrl: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/user/photos/setPrimary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ photoUrl }),
    });
    if (!response.ok) throw new Error("Failed to set primary photo");
    return response.json();
  },

  async removePhoto(photoUrl: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/user/photos/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ photoUrl }),
    });
    if (!response.ok) throw new Error("Failed to remove photo");
    return response.json();
  },
};

// Dating API
export const datingApi = {
  async discover(params?: {
    limit?: number;
    skip?: number;
  }): Promise<UserProfile[]> {
    const queryParams = new URLSearchParams({
      limit: String(params?.limit || 30),
      skip: String(params?.skip || 0),
    });
    const response = await fetch(`${API_URL}/dating/discover?${queryParams}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch discover feed");
    const data = await response.json();
    return data.data || data;
  },

  async customDiscover(customPrompt: string): Promise<UserProfile[]> {
    const response = await fetch(`${API_URL}/dating/ai/discover/custom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ customPrompt }),
    });
    if (!response.ok) throw new Error("Failed to fetch custom AI matches");
    const data = await response.json();
    return data.data || data;
  },

  async likeUser(targetId: string): Promise<{ matchId?: string }> {
    const response = await fetch(`${API_URL}/dating/like/${targetId}`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to like user");
    const data = await response.json();
    return data.data || data;
  },

  async superlikeUser(targetId: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/dating/superlike/${targetId}`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to superlike user");
    return response.json();
  },

  async unlikeUser(targetId: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/dating/like/${targetId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to unlike user");
    return response.json();
  },

  async getMatches(): Promise<Match[]> {
    const response = await fetch(`${API_URL}/dating/matches`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch matches");
    const data = await response.json();
    return data.data || data;
  },

  async unmatch(matchId: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/dating/unmatch/${matchId}`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to unmatch");
    return response.json();
  },

  async getLikesSent(): Promise<Like[]> {
    const response = await fetch(`${API_URL}/dating/likes/sent`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch sent likes");
    const data = await response.json();
    return data.data || data;
  },

  async getLikesReceived(): Promise<Like[]> {
    const response = await fetch(`${API_URL}/dating/likes/received`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch received likes");
    const data = await response.json();
    return data.data || data;
  },

  async getLikesAnalytics(): Promise<{ sent: number; received: number }> {
    const response = await fetch(`${API_URL}/dating/analytics/likes`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch likes analytics");
    const data = await response.json();
    return data.data || data;
  },

  async addFavorite(targetId: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/dating/favorites/${targetId}`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to add favorite");
    return response.json();
  },

  async removeFavorite(targetId: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/dating/favorites/${targetId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to remove favorite");
    return response.json();
  },

  async getFavorites(): Promise<Favorite[]> {
    const response = await fetch(`${API_URL}/dating/favorites`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch favorites");
    const data = await response.json();
    return data.data || data;
  },

  async blockUser(targetId: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/dating/block/${targetId}`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to block user");
    return response.json();
  },

  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_URL}/dating/conversations`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch conversations");
    const data = await response.json();
    return data.data || data;
  },

  async getMessages(
    conversationId: string,
    params?: { limit?: number; before?: string }
  ): Promise<Message[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.before) queryParams.append("before", params.before);
    const response = await fetch(
      `${API_URL}/dating/conversations/${conversationId}/messages?${queryParams}`,
      {
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch messages");
    const data = await response.json();
    return data.data || data;
  },

  async sendMessage(
    conversationId: string,
    messageData: { text?: string; mediaUrl?: string; type?: string }
  ): Promise<Message> {
    const response = await fetch(
      `${API_URL}/dating/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(messageData),
      }
    );
    if (!response.ok) throw new Error("Failed to send message");
    const data = await response.json();
    return data.data || data;
  },

  async getAIPrompt(): Promise<AIPromptData> {
    const response = await fetch(`${API_URL}/dating/ai/prompt`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch AI prompt");
    const data = await response.json();
    return data.data || data;
  },
};

// Events API (Mock - ready for backend implementation)
export const eventsApi = {
  async getEvents(): Promise<Event[]> {
    // Mock data - replace with actual API call when backend is ready
    // Future: add params for filtering
    return mockEvents;
  },

  async getEvent(eventId: string): Promise<Event> {
    const event = mockEvents.find((e) => e._id === eventId);
    if (!event) throw new Error("Event not found");
    return event;
  },

  async rsvpEvent(
    eventId: string,
    status: "attending" | "interested" | "not_attending"
  ): Promise<ApiResponse<EventRSVP>> {
    // Mock implementation - replace with actual API call
    return {
      success: true,
      data: {
        eventId,
        userId: "current-user",
        status,
        createdAt: new Date().toISOString(),
      },
    };
  },
};

// Rewards & Gamification Types
export interface Quest {
  _id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "achievement";
  reward: number; // PYUSD amount
  progress: number; // 0-100
  target: number;
  current: number;
  isCompleted: boolean;
  isClaimed: boolean;
  expiresAt?: string;
  icon: string;
}

export interface Achievement {
  _id: string;
  title: string;
  description: string;
  reward: number;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface RewardsBalance {
  total: number;
  pending: number;
  claimed: number;
  lastUpdated: string;
}

// Rewards API (Mock - ready for backend implementation)
export const rewardsApi = {
  async getBalance(): Promise<RewardsBalance> {
    // Mock data - replace with actual API call
    return mockRewardsBalance;
  },

  async getQuests(): Promise<Quest[]> {
    // Mock data - replace with actual API call
    return mockQuests;
  },

  async claimQuest(questId: string): Promise<ApiResponse<{ amount: number; newBalance: number }>> {
    // Mock implementation - replace with actual API call
    const quest = mockQuests.find((q) => q._id === questId);
    if (!quest || !quest.isCompleted || quest.isClaimed) {
      throw new Error("Quest cannot be claimed");
    }
    quest.isClaimed = true;
    mockRewardsBalance.total += quest.reward;
    mockRewardsBalance.claimed += quest.reward;

    return {
      success: true,
      message: "Reward claimed successfully",
      data: {
        amount: quest.reward,
        newBalance: mockRewardsBalance.total,
      },
    };
  },

  async getAchievements(): Promise<Achievement[]> {
    // Mock data - replace with actual API call
    return mockAchievements;
  },
};

// Mock rewards data - Realistic PYUSD values (cents to few dollars)
const mockRewardsBalance: RewardsBalance = {
  total: 12.50,
  pending: 3.25,
  claimed: 9.25,
  lastUpdated: new Date().toISOString(),
};

const mockQuests: Quest[] = [
  {
    _id: "q1",
    title: "Daily Login",
    description: "Login to the app today",
    type: "daily",
    reward: 0.10, // 10 cents
    progress: 100,
    target: 1,
    current: 1,
    isCompleted: true,
    isClaimed: false,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    icon: "calendar",
  },
  {
    _id: "q2",
    title: "Send 5 Likes",
    description: "Like 5 profiles today",
    type: "daily",
    reward: 0.25, // 25 cents
    progress: 60,
    target: 5,
    current: 3,
    isCompleted: false,
    isClaimed: false,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    icon: "heart",
  },
  {
    _id: "q3",
    title: "Complete Profile",
    description: "Add bio and 3+ photos",
    type: "achievement",
    reward: 2.00, // $2
    progress: 66,
    target: 100,
    current: 66,
    isCompleted: false,
    isClaimed: false,
    icon: "user",
  },
  {
    _id: "q4",
    title: "Start a Conversation",
    description: "Send a message to a match",
    type: "daily",
    reward: 0.50, // 50 cents
    progress: 0,
    target: 1,
    current: 0,
    isCompleted: false,
    isClaimed: false,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    icon: "message",
  },
];

const mockAchievements: Achievement[] = [
  {
    _id: "a1",
    title: "First Match",
    description: "Get your first match",
    reward: 1.00, // $1
    unlocked: false,
    icon: "trophy",
    rarity: "rare",
  },
  {
    _id: "a2",
    title: "Profile Complete",
    description: "Complete your profile 100%",
    reward: 2.00, // $2
    unlocked: false,
    icon: "award",
    rarity: "common",
  },
  {
    _id: "a3",
    title: "Event Attendee",
    description: "Attend your first event",
    reward: 5.00, // $5
    unlocked: false,
    icon: "star",
    rarity: "epic",
  },
  {
    _id: "a4",
    title: "Social Butterfly",
    description: "Get 10 matches",
    reward: 10.00, // $10
    unlocked: false,
    icon: "users",
    rarity: "epic",
  },
  {
    _id: "a5",
    title: "Conversation Starter",
    description: "Send 50 messages",
    reward: 3.00, // $3
    unlocked: false,
    icon: "messageCircle",
    rarity: "common",
  },
];

// Mock event data
const mockEvents: Event[] = [
  {
    _id: "1",
    title: "Speed Dating Night",
    description: "Meet 10+ singles in one evening through quick 5-minute conversations",
    type: "speed_dating",
    date: "2025-10-25",
    time: "19:00",
    location: {
      name: "The Rooftop Lounge",
      address: "123 Downtown Ave, City Center",
      coordinates: [-122.4194, 37.7749],
    },
    capacity: 40,
    attendees: 28,
    price: 25,
    tags: ["21-35", "professionals", "casual"],
    ageRange: { min: 21, max: 35 },
    organizer: "TrueD8 Events",
  },
  {
    _id: "2",
    title: "Mystery Match Trail",
    description: "Follow clues to discover potential matches at various city hotspots",
    type: "mystery_match",
    date: "2025-10-27",
    time: "14:00",
    location: {
      name: "City Park",
      address: "456 Park Boulevard",
      coordinates: [-122.4084, 37.7849],
    },
    capacity: 30,
    attendees: 15,
    price: 15,
    tags: ["25-40", "adventure", "gamified"],
    ageRange: { min: 25, max: 40 },
    organizer: "TrueD8 Events",
  },
  {
    _id: "3",
    title: "Wine Tasting Mixer",
    description: "Sophisticated evening of wine tasting and mingling with like-minded singles",
    type: "mixer",
    date: "2025-10-28",
    time: "18:30",
    location: {
      name: "Vineyard Gallery",
      address: "789 Wine Street",
      coordinates: [-122.4284, 37.7649],
    },
    capacity: 50,
    attendees: 42,
    price: 35,
    tags: ["28-45", "upscale", "wine"],
    ageRange: { min: 28, max: 45 },
    organizer: "TrueD8 Events",
  },
  {
    _id: "4",
    title: "Hiking & Coffee Meetup",
    description: "Outdoor adventure followed by coffee and conversation",
    type: "group_activity",
    date: "2025-10-29",
    time: "09:00",
    location: {
      name: "Mountain Trail Start",
      address: "Trail Head Park",
      coordinates: [-122.4384, 37.7949],
    },
    capacity: 25,
    attendees: 18,
    price: 10,
    tags: ["22-38", "outdoors", "active"],
    ageRange: { min: 22, max: 38 },
    organizer: "TrueD8 Events",
  },
];
