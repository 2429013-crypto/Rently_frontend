import "./Register.css";
import { useState, useEffect, useRef, useCallback } from "react";
import { sendOTP, verifyOTP, registerUser } from "./api";
import rentlyBg from "./assets/images/rently-bg.jpg";
import { Eye, EyeOff } from "lucide-react";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 180; // 3 minutes
const MIN_PASSWORD_LENGTH = 8; // the only hard password rule
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REDIRECT_DELAY_MS = 1500; // how long the success message is shown before going to login

function getPasswordChecks(password: string) {
  return {
    length: password.length >= MIN_PASSWORD_LENGTH,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

type RegisterProps = {
  // Called when the user should be taken to the login page
  // (after registering, or when they click the "Login" link).
  // If it isn't passed, we fall back to a normal browser redirect to /login.
  onGoToLogin?: () => void;
};

function Register({ onGoToLogin }: RegisterProps) {
  const goToLogin = () => {
    if (onGoToLogin) {
      onGoToLogin();
    } else {
      window.location.replace("/login");
    }
  };

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Registration state: once the account exists, the whole form is locked
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const lastSentEmail = useRef("");

  const otp = otpDigits.join("");
  const passwordChecks = getPasswordChecks(password);
  const passedCount = Object.values(passwordChecks).filter(Boolean).length;
  // Only rule: minimum length. Strength is just a hint shown in the popup.
  const isPasswordValid = password.length >= MIN_PASSWORD_LENGTH;
  const strengthLevel = isPasswordValid ? passedCount : Math.min(passedCount, 1);
  const strengthLabel = !isPasswordValid
    ? "Too short"
    : ["Weak", "Weak", "Weak", "Fair", "Good", "Strong"][passedCount];

  // Password field is locked until the email is verified AND again once the
  // account has been created (no changing the password after registering;
  // forgotten passwords are handled from the login page).
  const isPasswordLocked = !isVerified || registrationComplete;

  /* ---------------- SEND OTP ---------------- */

  const requestOTP = useCallback(
    async (targetEmail: string, isResend = false) => {
      setMessage("");
      setError("");
      setOtpError("");
      setSendFailed(false);
      setIsSending(true);
      lastSentEmail.current = targetEmail;

      try {
        await sendOTP(targetEmail);

        // email was edited while the request was in flight -> ignore
        if (lastSentEmail.current !== targetEmail) return;

        setOtpDigits(Array(OTP_LENGTH).fill(""));
        setStep("otp");
        setSecondsLeft(RESEND_SECONDS);
        setMessage(
          isResend
            ? "A new OTP has been sent to your email."
            : "OTP sent successfully. Please check your email."
        );

        // move focus to the first OTP box (unless the user is still typing the email)
        setTimeout(() => {
          if (document.activeElement?.id !== "email") {
            otpRefs.current[0]?.focus();
          }
        }, 100);
      } catch (err) {
        if (lastSentEmail.current !== targetEmail) return;
        setSendFailed(true);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setIsSending(false);
      }
    },
    []
  );

  // Auto-send the OTP once the email is valid (small delay so we don't fire
  // while the user is still typing, e.g. "a@b.co" on the way to "a@b.com")
  useEffect(() => {
    const trimmed = email.trim();

    if (
      isVerified ||
      !EMAIL_REGEX.test(trimmed) ||
      lastSentEmail.current === trimmed
    ) {
      return;
    }

    const timer = setTimeout(() => {
      if (lastSentEmail.current !== trimmed) {
        requestOTP(trimmed);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [email, isVerified, requestOTP]);

  const handleEmailBlur = () => {
    const trimmed = email.trim();
    if (
      !isVerified &&
      EMAIL_REGEX.test(trimmed) &&
      lastSentEmail.current !== trimmed
    ) {
      requestOTP(trimmed);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setMessage("");
    setError("");
    setSendFailed(false);
    lastSentEmail.current = "";

    // email edited after an OTP was sent -> that OTP no longer applies
    if (step === "otp") {
      setStep("email");
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setOtpError("");
      setSecondsLeft(0);
    }
  };

  /* ---------------- RESEND TIMER ---------------- */

  useEffect(() => {
    if (step !== "otp" || isVerified || secondsLeft <= 0) return;

    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, isVerified, secondsLeft]);

  const handleResend = () => {
    if (secondsLeft > 0 || isSending || isVerified) return;
    requestOTP(email.trim(), true);
  };

  /* ---------------- OTP INPUT HANDLING ---------------- */

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    setOtpError("");
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      // empty box -> jump back and clear the previous one
      e.preventDefault();
      setOtpError("");
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const next: string[] = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((digit, i) => {
      next[i] = digit;
    });

    setOtpError("");
    setOtpDigits(next);
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleOtpCopy = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!otp) return;
    e.preventDefault();
    e.clipboardData.setData("text/plain", otp);
  };

  /* ---------------- AUTO VERIFY ---------------- */

  useEffect(() => {
    if (step !== "otp" || isVerified || otp.length !== OTP_LENGTH) return;

    const verify = async () => {
      setIsVerifying(true);
      setOtpError("");

      try {
        await verifyOTP(email.trim(), otp);

        setIsVerified(true);
        setMessage("");
        setError("");
      } catch (err) {
        console.error("verifyOTP failed:", err);
        setOtpError(
          err instanceof Error && err.message
            ? err.message
            : "Invalid OTP. Please try again."
        );
        setOtpDigits(Array(OTP_LENGTH).fill(""));
        otpRefs.current[0]?.focus();
      } finally {
        setIsVerifying(false);
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  /* ---------------- CREATE ACCOUNT ---------------- */

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !isVerified ||
      !isPasswordValid ||
      isRegistering ||
      registrationComplete
    ) {
      return;
    }

    setMessage("");
    setError("");
    setIsRegistering(true);

    try {
      await registerUser(email.trim(), password);
      console.log("Registered successfully");

      // lock the form for good and let the redirect effect take over
      setRegistrationComplete(true);
      setPasswordFocused(false);
      setMessage("Account created successfully! Redirecting to login...");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setIsRegistering(false);
    }
  };

  /* ---------------- REDIRECT TO LOGIN AFTER REGISTRATION ---------------- */

  useEffect(() => {
    if (!registrationComplete) return;

    const timer = setTimeout(() => {
      goToLogin();
    }, REDIRECT_DELAY_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationComplete]);

  return (
    <div className="register-page">

      {/* LEFT SIDE */}
      <section
        className="register-hero"
        style={{ backgroundImage: `url(${rentlyBg})` }}
      >
        <div className="hero-overlay"></div>

        <div className="hero-content">

          <div className="brand">
            <div className="brand-icon">⌂</div>
            <span>Rently</span>
          </div>

          <div className="hero-text">
            <p className="hero-small-title">
              RENT • BUY • BELONG
            </p>

            <h1>
              Find Your
              <br />
              Perfect Space
            </h1>

            <p className="hero-description">
              Discover homes that fit your lifestyle,
              budget, and dreams. Your next chapter
              starts here.
            </p>
          </div>

          <div className="hero-features">

            <div className="feature">
              <div className="feature-icon">⌂</div>
              <div>
                <h3>Find Your Place</h3>
                <p>Thousands of spaces waiting for you.</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">◇</div>
              <div>
                <h3>Verified Listings</h3>
                <p>Explore trusted and verified properties.</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">✓</div>
              <div>
                <h3>Simple & Secure</h3>
                <p>A smooth and secure rental experience.</p>
              </div>
            </div>

          </div>

          <div className="hero-bottom">
            <span>More than just a place,</span>
            <strong>it's a beginning.</strong>
          </div>

        </div>
      </section>


      {/* RIGHT SIDE */}
      <section className="register-form-section">

        <div className="register-top">

        </div>

        <div className="register-card">

          <div className="card-header">

            <div className="card-logo">
              R
            </div>

            <h2>Join Rently Today</h2>

            <p>
              Create your account and find your
              perfect space.
            </p>

          </div>


          {message && (
            <p className="success-message">
              {message}
            </p>
          )}

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <form className="register-form" onSubmit={handleRegister}>

            {/* EMAIL */}
            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ✉
                </span>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  disabled={isVerified || isVerifying || registrationComplete}
                  autoComplete="email"
                  required
                />

              </div>

              {isSending && (
                <p className="otp-hint">Sending OTP...</p>
              )}

              {sendFailed && !isSending && (
                <p className="otp-hint">
                  <button
                    type="button"
                    className="resend-button"
                    onClick={() => requestOTP(email.trim())}
                  >
                    Try sending OTP again
                  </button>
                </p>
              )}

            </div>


            {/* OTP (appears automatically once the OTP is sent) */}
            {step === "otp" && (
              <div className="form-group otp-group">

                <label htmlFor="otp-0">
                  Enter OTP
                </label>

                <div className="otp-boxes">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      className={
                        "otp-box" +
                        (digit ? " filled" : "") +
                        (otpError ? " error" : "") +
                        (isVerified ? " verified" : "")
                      }
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      value={digit}
                      disabled={isVerified}
                      readOnly={isVerifying}
                      aria-label={`OTP digit ${index + 1}`}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      onCopy={handleOtpCopy}
                      onFocus={(e) => e.target.select()}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="otp-error">{otpError}</p>
                )}

                {isVerifying && (
                  <p className="otp-hint">Verifying...</p>
                )}

                {isVerified ? (
                  <p className="otp-verified">✓ Email verified</p>
                ) : secondsLeft > 0 ? (
                  <p className="otp-timer">
                    Resend OTP in <strong>{formatTime(secondsLeft)}</strong>
                  </p>
                ) : (
                  <p className="otp-timer expired">
                    Didn't get the code?{" "}
                    <button
                      type="button"
                      className="resend-button"
                      onClick={handleResend}
                      disabled={isSending}
                    >
                      Resend OTP
                    </button>
                  </p>
                )}

              </div>
            )}


            {/* PASSWORD (locked until the email is verified, and locked again once registered) */}
            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className={"input-wrapper" + (isPasswordLocked ? " locked" : "")}>

                <span className="input-icon">
                  🔒
                </span>

                <input
                  id="password"
                  className="password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    isVerified
                      ? "Create a strong password"
                      : "Verify your email first"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  disabled={isPasswordLocked}
                  readOnly={isRegistering}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

                {/* small popup shown only while typing the password */}
                {isVerified && !registrationComplete && passwordFocused && (
                  <div className="password-popover" role="status">
                    <strong>Create a strong password</strong>
                    <span>
                      Use {MIN_PASSWORD_LENGTH}+ characters and mix letters,
                      numbers and symbols.
                    </span>

                    {password && (
                      <div className="strength-row">
                        <div className="strength-bar">
                          <span
                            className={`strength-fill level-${strengthLevel}`}
                            style={{ width: `${(strengthLevel / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`strength-label level-${strengthLevel}`}>
                          {strengthLabel}
                        </span>
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>


            {/* REGISTER BUTTON */}
            <button
              type="submit"
              className="register-button"
              disabled={
                !isVerified ||
                !isPasswordValid ||
                isRegistering ||
                registrationComplete
              }
            >
              {isRegistering ? "Creating account..." : "Create Account"}
              <span>→</span>
            </button>

          </form>

          <div className="divider">
            <span>OR</span>
          </div>


          <p className="login-text">
            Already have an account?
            <button
              type="button"
              className="login-link-inline"
              onClick={goToLogin}
            >
              Login
            </button>
          </p>

        </div>

        <p className="copyright">
          © 2026 Rently. Find a place you'll love.
        </p>

      </section>

    </div>
  );
}

export default Register; 