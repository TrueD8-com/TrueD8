const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.trued8.com";

export interface NonceResponse {
  nonce: string;
  domain: string;
  chain: string;
}

export interface VerifyResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    wallet: {
      address: string;
      chain: string;
    };
  };
}

export interface RefreshResponse {
  accessToken: string;
}

export interface UserResponse {
  user: {
    id: number;
    wallet: {
      address: string;
      chain: string;
    };
    created_at: string;
  };
  profile: {
    user_id: number;
    display_name: string;
    bio: string;
    age: number;
    location: string;
    photos: string[];
    interests: string[];
  } | null;
  snapshots: {
    user_id: number;
    likes_received: number;
    matches_count: number;
    events_attended: number;
  } | null;
}

// Auth API
export const authApi = {
  async getNonce(address: string): Promise<NonceResponse> {
    const response = await fetch(`${API_URL}/auth/siwe/nonce?address=${address}`);
    if (!response.ok) throw new Error("Failed to get nonce");
    return response.json();
  },

  async verify(message: string, signature: string): Promise<VerifyResponse> {
    const response = await fetch(`${API_URL}/auth/siwe/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, signature }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Verification failed");
    }
    return response.json();
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) throw new Error("Token refresh failed");
    return response.json();
  },

  async logout(accessToken: string): Promise<void> {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Logout failed");
  },

  async getMe(accessToken: string): Promise<UserResponse> {
    const response = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error("Failed to get user data");
    return response.json();
  },
};
