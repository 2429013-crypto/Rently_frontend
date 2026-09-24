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