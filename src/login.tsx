import "./Login.css";
import { useEffect, useRef, useState } from "react";
import { loginUser, forgotPassword, verifyResetOTP, resetPassword } from "./api";
import rentlyBg from "./assets/images/rently-bg.jpg";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 180;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

type Props = { onGoToRegister?: () => void };

export default function Login({ onGoToRegister }: Props) {
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const clear = () => { setMessage(""); setError(""); };

  const goRegister = () => onGoToRegister ? onGoToRegister() : (window.location.href = "/register");
  const backLogin = () => {
    setMode("login"); setOtpSent(false); setOtpVerified(false);
    setOtp(Array(OTP_LENGTH).fill("")); clear();
  };

  const sendCode = async () => {
    clear();
    if (!email.trim()) { setError("Enter your email address first."); return; }
    setBusy(true);
    try {
      await forgotPassword(email.trim());
      setOtpSent(true); setOtpVerified(false); setOtp(Array(OTP_LENGTH).fill(""));
      setSecondsLeft(RESEND_SECONDS);
      setMessage("A password reset code has been sent to your email.");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send reset code. Try again.");
    } finally { setBusy(false); }
  };

  useEffect(() => {
    if (!otpSent || otpVerified || secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft(v => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [otpSent, otpVerified, secondsLeft]);

  const otpValue = otp.join("");
  useEffect(() => {
    if (mode !== "forgot" || !otpSent || otpVerified || otpValue.length !== OTP_LENGTH) return;
    let cancelled = false;
    (async () => {
      setOtpBusy(true); clear();
      try {
        await verifyResetOTP(email.trim(), otpValue);
        if (!cancelled) { setOtpVerified(true); setMessage("Email verified. Enter your new password."); }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Invalid or expired code.");
          setOtp(Array(OTP_LENGTH).fill(""));
          otpRefs.current[0]?.focus();
        }
      } finally { if (!cancelled) setOtpBusy(false); }
    })();
    return () => { cancelled = true; };
  }, [otpValue, mode, otpSent, otpVerified, email]);

  const changeOtp = (i: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp(prev => { const next = [...prev]; next[i] = digit; return next; });
    if (digit && i < OTP_LENGTH - 1) otpRefs.current[i + 1]?.focus();
  };
  const keyOtp = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      e.preventDefault();
      setOtp(prev => { const next = [...prev]; next[i - 1] = ""; return next; });
      otpRefs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) otpRefs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) otpRefs.current[i + 1]?.focus();
  };
  const pasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!value) return;
    const next = Array(OTP_LENGTH).fill("");
    value.split("").forEach((d, i) => next[i] = d);
    setOtp(next); otpRefs.current[Math.min(value.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); clear(); setBusy(true);
    try {
      await loginUser(email.trim(), password);
      setMessage("Login successful. Redirecting...");
      setTimeout(() => { window.location.href = "/dashboard"; }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Check your details.");
    } finally { setBusy(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); clear();
    if (!otpVerified) { setError("Verify the code first."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      await resetPassword(email.trim(), newPassword);
      setMessage("Password reset successfully. You can now log in.");
      setMode("login"); setPassword(""); setNewPassword(""); setConfirmPassword("");
      setOtpSent(false); setOtpVerified(false); setOtp(Array(OTP_LENGTH).fill(""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password.");
    } finally { setBusy(false); }
  };

  return (
    <div className="register-page login-page">
      <section className="register-hero" style={{ backgroundImage: `url(${rentlyBg})` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="brand"><div className="brand-icon">⌂</div><span>Rently</span></div>
          <div className="hero-text">
            <p className="hero-small-title">RENT • BUY • BELONG</p>
            <h1>Find Your<br />Perfect Space</h1>
            <p className="hero-description">Discover homes that fit your lifestyle, budget, and dreams. Your next chapter starts here.</p>
          </div>
          <div className="hero-features">
            <div className="feature"><div className="feature-icon">⌂</div><div><h3>Find Your Place</h3><p>Thousands of spaces waiting for you.</p></div></div>
            <div className="feature"><div className="feature-icon">◇</div><div><h3>Verified Listings</h3><p>Explore trusted and verified properties.</p></div></div>
            <div className="feature"><div className="feature-icon">✓</div><div><h3>Simple &amp; Secure</h3><p>A smooth and secure rental experience.</p></div></div>
          </div>
          <div className="hero-bottom"><span>More than just a place,</span><strong>it's a beginning.</strong></div>
        </div>
      </section>

      <section className="register-form-section login-form-section">
        <div className="register-card login-card">
          <div className="card-header">
            <div className="card-logo">R</div>
            <h2>{mode === "login" ? "Welcome Back!" : "Reset Your Password"}</h2>
            <p>{mode === "login" ? "Sign in to continue to your Rently account." : "We'll help you get back into your account."}</p>
          </div>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          {mode === "login" ? (
            <form className="register-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <div className="input-wrapper"><Mail className="input-icon-svg" size={18} />
                  <input id="login-email" type="email" placeholder="Enter your email" value={email}
                    onChange={e => { setEmail(e.target.value); clear(); }} autoComplete="email" required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="input-wrapper"><Lock className="input-icon-svg" size={18} />
                  <input id="login-password" type={showPassword ? "text" : "password"} placeholder="Enter your password"
                    value={password} onChange={e => { setPassword(e.target.value); clear(); }} autoComplete="current-password" required />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
                </div>
              </div>
              <div className="login-forgot-row"><button type="button" className="login-text-button" onClick={() => {
                setMode("forgot"); setOtpSent(false); setOtpVerified(false); setOtp(Array(OTP_LENGTH).fill(""));
                setNewPassword(""); setConfirmPassword(""); clear();
              }}>Forgot Password?</button></div>
              <button className="register-button" type="submit" disabled={busy}>{busy ? "Signing in..." : "Login"} <ArrowRight size={19} /></button>
            </form>
          ) : (
            <form className="register-form" onSubmit={handleReset}>
              <div className="form-group">
                <label htmlFor="reset-email">Email Address</label>
                <div className="input-wrapper"><Mail className="input-icon-svg" size={18} />
                  <input id="reset-email" type="email" placeholder="Enter your registered email" value={email}
                    onChange={e => { setEmail(e.target.value); setOtpSent(false); setOtpVerified(false); setOtp(Array(OTP_LENGTH).fill("")); clear(); }}
                    disabled={otpVerified} required />
                </div>
              </div>
              {!otpSent ? (
                <button type="button" className="register-button" onClick={sendCode} disabled={busy}>
                  {busy ? "Sending code..." : "Send Reset Code"} <ArrowRight size={19} />
                </button>
              ) : (
                <>
                  <div className="form-group otp-group">
                    <label>6-Digit Verification Code</label>
                    <div className="otp-boxes">
                      {otp.map((digit, i) => <input key={i} ref={el => { otpRefs.current[i] = el; }}
                        className={"otp-box" + (digit ? " filled" : "") + (otpVerified ? " verified" : "")}
                        aria-label={`OTP digit ${i + 1}`} inputMode="numeric" maxLength={1} value={digit}
                        disabled={otpVerified} onChange={e => changeOtp(i, e.target.value)} onKeyDown={e => keyOtp(i, e)} onPaste={pasteOtp} />)}
                    </div>
                    {otpBusy && <p className="otp-hint">Verifying code...</p>}
                    {otpVerified && <p className="otp-verified">✓ Email verified</p>}
                    {!otpVerified && secondsLeft > 0 && <p className="otp-timer">Resend code in <strong>{fmt(secondsLeft)}</strong></p>}
                    {!otpVerified && secondsLeft <= 0 && <p className="otp-timer expired">Didn't receive the code? <button type="button" className="resend-button" onClick={sendCode} disabled={busy}>Resend code</button></p>}
                  </div>
                  {otpVerified && <>
                    <div className="form-group">
                      <label htmlFor="new-password">New Password</label>
                      <div className="input-wrapper"><Lock className="input-icon-svg" size={18} />
                        <input id="new-password" type={showNew ? "text" : "password"} placeholder="At least 8 characters" value={newPassword}
                          onChange={e => { setNewPassword(e.target.value); clear(); }} autoComplete="new-password" required />
                        <button type="button" className="password-toggle" onClick={() => setShowNew(v => !v)} aria-label="Toggle new password visibility">{showNew ? <EyeOff size={19} /> : <Eye size={19} />}</button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirm-password">Confirm New Password</label>
                      <div className="input-wrapper"><Lock className="input-icon-svg" size={18} />
                        <input id="confirm-password" type={showConfirm ? "text" : "password"} placeholder="Re-enter new password" value={confirmPassword}
                          onChange={e => { setConfirmPassword(e.target.value); clear(); }} autoComplete="new-password" required />
                        <button type="button" className="password-toggle" onClick={() => setShowConfirm(v => !v)} aria-label="Toggle confirm password visibility">{showConfirm ? <EyeOff size={19} /> : <Eye size={19} />}</button>
                      </div>
                    </div>
                    <button className="register-button" type="submit" disabled={busy}>{busy ? "Resetting..." : "Reset Password"} <ArrowRight size={19} /></button>
                   </>}
                </>
              )}
            </form>
          )}

          <div className="divider"><span>OR</span></div>
          {mode === "login" ? (
            <p className="login-text">Don't have an account? <button type="button" className="login-link-inline" onClick={goRegister}>Create Account</button></p>
          ) : (
            <p className="login-text"><button type="button" className="login-link-inline login-back-button" onClick={backLogin}><ArrowLeft size={15} /> Back to Login</button></p>
          )}
        </div>
        <p className="copyright">© 2026 Rently. Find a place you'll love.</p>
      </section>
    </div>
  );
}