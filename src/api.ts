const API_BASE_URL = "http://localhost:5000";

// =============================================================
// REGISTRATION - SEND OTP
// =============================================================

export async function sendOTP(email: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/send-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to send OTP");
  }

  return data;
}

// =============================================================
// REGISTRATION - RESEND OTP
// =============================================================

export async function resendOTP(email: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/resend-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to resend OTP");
  }

  return data;
}

// =============================================================
// REGISTRATION - VERIFY OTP
// =============================================================

export async function verifyOTP(
  email: string,
  otp: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/verify-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp,
      }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Invalid OTP");
  }

  return data;
}

// =============================================================
// REGISTRATION - CREATE ACCOUNT
// =============================================================

export async function registerUser(
  email: string,
  password: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
}

// =============================================================
// LOGIN
// =============================================================

export async function loginUser(
  email: string,
  password: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

// =============================================================
// FORGOT PASSWORD - SEND OTP
// =============================================================

export async function forgotPassword(email: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/forgot-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to send OTP");
  }

  return data;
}

// =============================================================
// FORGOT PASSWORD - VERIFY OTP
// =============================================================

export async function verifyResetOTP(
  email: string,
  otp: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/verify-reset-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "OTP verification failed");
  }

  return data;
}

// =============================================================
// FORGOT PASSWORD - RESET PASSWORD
// =============================================================

export async function resetPassword(
  email: string,
  newPassword: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/reset-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        newPassword,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Password reset failed");
  }

  return data;
}

// =============================================================
// GET CURRENT LOGGED-IN USER
// =============================================================

export async function getCurrentUser() {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/me`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Not authenticated");
  }

  return data;
}

// =============================================================
// LOGOUT
// =============================================================

export async function logoutUser() {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/logout`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Logout failed");
  }

  return data;
}

// =============================================================
// PROFILE - PROFILE DATA TYPE
// =============================================================

export interface UserProfile {
  id?: number;
  userId?: number;
  fullName: string;
  phone: string;
  city: string;
  address: string;
  profilePicture?: string | null;
  bio?: string | null;
  isProfileComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// =============================================================
// PROFILE - GET CURRENT USER PROFILE
// =============================================================

export async function getUserProfile() {
  const response = await fetch(
    `${API_BASE_URL}/api/profile/me`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not fetch your profile");
  }

  return data;
}

// =============================================================
// PROFILE - CREATE OR UPDATE PROFILE
// =============================================================

export async function updateUserProfile(
  profile: UserProfile
) {
  const response = await fetch(
    `${API_BASE_URL}/api/profile/me`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: profile.fullName,
        phone: profile.phone,
        city: profile.city,
        address: profile.address,
        bio: profile.bio ?? "",
        profilePicture: profile.profilePicture ?? null,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not save your profile");
  }

  return data;
}

// =============================================================
// PROFILE - DELETE PROFILE
// =============================================================

export async function deleteUserProfile() {
  const response = await fetch(
    `${API_BASE_URL}/api/profile/me`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not delete your profile");
  }

  return data;
}

// =============================================================
// PROPERTIES - GET ALL PROPERTIES
// =============================================================

export interface BackendProperty {
  id: number;
  ownerId: number;
  title: string;
  description?: string;
  type: "House" | "Flat" | "PG" | "Shared";
  address: string;
  city: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: string | null;
  rent: number;
  deposit?: number | null;
  furnishing?: string | null;
  available?: boolean;
  image?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  User?: {
    id?: number;
    email?: string;
  } | null;
}

export async function getProperties() {
  const response = await fetch(
    `${API_BASE_URL}/api/properties`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch properties");
  }

  return data;
}

export async function getPropertyById(id: number | string) {
  const response = await fetch(
    `${API_BASE_URL}/api/properties/${id}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch property details");
  }

  return data;
}


export async function getMyProperties() {
  const response = await fetch(
    `${API_BASE_URL}/api/properties/my`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch your properties");
  }

  return data;
}

export async function updatePropertyApi(id: number, payload: Partial<BackendProperty>) {
  const response = await fetch(
    `${API_BASE_URL}/api/properties/${id}`,
    {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update property");
  }

  return data;
}

export async function deletePropertyApi(id: number) {
  const response = await fetch(
    `${API_BASE_URL}/api/properties/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete property");
  }

  return data;
}

 