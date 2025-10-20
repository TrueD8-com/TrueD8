const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.trued8.com";

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
