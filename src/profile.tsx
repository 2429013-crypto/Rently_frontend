import "./profile.css";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  Home,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Upload,
  User,
} from "lucide-react";
import profileBg from "./assets/images/rently-login-bg.webp";
import { getCurrentUser, getUserProfile, updateUserProfile } from "./api";

const ABOUT_MAX_LENGTH = 300;
const MAX_PHOTO_MB = 5;
const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  onComplete?: () => void;
};

export default function ProfileSetup({ onComplete }: Props) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [about, setAbout] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadProfileData = async () => {
      try {
        setLoadingUser(true);
        const userData = await getCurrentUser().catch(() => null);
        if (!cancelled && userData) {
          setEmail(userData.user?.email ?? userData.email ?? "");
        }

        const profileData = await getUserProfile();
        const p = profileData?.profile;
        if (!cancelled && p) {
          if (p.fullName) setFullName(p.fullName);
          if (p.phone) setPhone(p.phone);
          if (p.city) setCity(p.city);
          if (p.address) setAddress(p.address);
          if (p.bio) setAbout(p.bio);
          if (p.profilePicture) setPhotoPreview(p.profilePicture);
        }
      } catch (err) {
        console.log("No profile found or error fetching profile:", err);
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    };
    void loadProfileData();
    return () => { cancelled = true; };
  }, []);


  useEffect(() => {
    return () => { if (photoPreview) URL.revokeObjectURL(photoPreview); };
  }, [photoPreview]);

  const requiredFields = [fullName.trim(), phone.trim(), city.trim(), address.trim()];
  const stepsTotal = requiredFields.length + 1;
  const stepsDone = requiredFields.filter(Boolean).length + (photoFile ? 1 : 0);
  const progressPercent = Math.round((stepsDone / stepsTotal) * 100);

  const handlePhotoPick = () => photoInputRef.current?.click();

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) { setError("Please upload a JPG, PNG or WEBP image."); return; }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) { setError(`Image must be smaller than ${MAX_PHOTO_MB} MB.`); return; }
    setError("");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(""); setMessage("");
    if (!fullName.trim() || !phone.trim() || !city.trim() || !address.trim()) {
      setError("Please fill in all required fields."); return;
    }
    if (!/^\d{10}$/.test(phone.trim())) { setError("Enter a valid 10-digit mobile number."); return; }
    setSaving(true);
    try {
      await updateUserProfile({ fullName: fullName.trim(), phone: phone.trim(), city: city.trim(), address: address.trim(), bio: about.trim() });
      setMessage("Profile saved! Taking you to your dashboard.");
      window.setTimeout(() => { if (onComplete) onComplete(); else window.location.href = "/dashboard"; }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile.");
    } finally { setSaving(false); }
  };

  return (
    <div className="profile-page">

      {/* ── LEFT HERO ── */}
      <section className="profile-hero" style={{ backgroundImage: `url(${profileBg})` }}>
        <div className="profile-hero-overlay" />
        <div className="profile-hero-content">

          <div className="profile-brand">
            <div className="profile-brand-icon">⌂</div>
            <span>Rently</span>
          </div>

          <div className="profile-hero-text">
            <p className="profile-hero-small-title">RENT • BUY • BELONG</p>
            <h1>Complete Your<br /><em>Profile</em></h1>
            <p className="profile-hero-description">
              Add your details to personalize your Rently account and unlock the best rental experience.
            </p>
          </div>

          <div className="profile-hero-features">
            <div className="profile-feature">
              <div className="profile-feature-icon"><User size={17} /></div>
              <div><h3>Build Trust</h3><p>Help landlords and renters get to know you.</p></div>
            </div>
            <div className="profile-feature">
              <div className="profile-feature-icon"><Home size={17} /></div>
              <div><h3>Better Matches</h3><p>Find rentals tailored to your needs.</p></div>
            </div>
            <div className="profile-feature">
              <div className="profile-feature-icon"><ShieldCheck size={17} /></div>
              <div><h3>Safe &amp; Secure</h3><p>A verified profile keeps everyone safe.</p></div>
            </div>
          </div>

          <div className="profile-hero-bottom">
            <span>More than just a place,</span>
            <strong>it's a beginning.</strong>
          </div>

        </div>
      </section>

      {/* ── RIGHT FORM ── */}
      <section className="profile-form-section">
        <div className="profile-card">

          {/* CARD HEADER */}
          <div className="profile-card-header">
            <div className="profile-card-logo">⌂</div>
            <h2>Profile Setup</h2>
            <p>A few details and you're ready to explore.</p>
          </div>

          {/* PROGRESS */}
          <div className="profile-progress-row">
            <div className="profile-progress-track">
              <div className="profile-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="profile-progress-label">{progressPercent}% complete</span>
          </div>

          {/* STEP DOTS */}
          <div className="profile-steps">
            {["Photo", "Personal", "Location", "About"].map((label, i) => (
              <div key={label} className={`profile-step ${i < stepsDone ? "done" : i === stepsDone ? "active" : ""}`}>
                <div className="profile-step-dot">{i < stepsDone ? "✓" : i + 1}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* MESSAGES */}
          {error   && <p className="profile-error"   role="alert">{error}</p>}
          {message && <p className="profile-success" role="status">{message}</p>}

          {/* PHOTO UPLOAD */}
          <div className="profile-photo-section">
            <div className="profile-avatar-wrap" onClick={handlePhotoPick} role="button" tabIndex={0}
              aria-label="Upload profile photo" onKeyDown={e => e.key === "Enter" && handlePhotoPick()}>
              <div className="profile-avatar">
                {photoPreview
                  ? <img src={photoPreview} alt="Profile preview" />
                  : <User size={32} strokeWidth={1.5} />}
              </div>
              <div className="profile-avatar-badge"><Camera size={13} /></div>
            </div>
            <div className="profile-photo-meta">
              <p className="profile-photo-title">Profile Photo</p>
              <p className="profile-photo-sub">Upload a clear, friendly photo of yourself.</p>
              <input ref={photoInputRef} type="file" accept={ACCEPTED_PHOTO_TYPES.join(",")} onChange={handlePhotoChange} hidden />
              <button type="button" className="profile-upload-btn" onClick={handlePhotoPick}>
                <Upload size={13} /> Upload Photo
              </button>
              <span className="profile-photo-hint">JPG, PNG or WEBP · Max {MAX_PHOTO_MB} MB</span>
            </div>
          </div>

          {/* FORM */}
          <form className="profile-form" onSubmit={handleSubmit}>

            {/* SECTION: Personal Info */}
            <div className="profile-section-label">
              <User size={13} /> Personal Information
            </div>
            <div className="profile-grid">
              <div className="profile-field">
                <label htmlFor="fullName">Full Name <span className="req">*</span></label>
                <div className="profile-input-wrapper">
                  <User size={15} className="profile-input-icon" />
                  <input id="fullName" type="text" placeholder="Your full name"
                    value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" required />
                </div>
              </div>

              <div className="profile-field">
                <label htmlFor="p-email">Email Address</label>
                <div className="profile-input-wrapper">
                  <Mail size={15} className="profile-input-icon" />
                  <input id="p-email" type="email"
                    placeholder={loadingUser ? "Loading..." : "abc@gmail.com"}
                    value={email} disabled autoComplete="email" />
                </div>
                <span className="profile-field-hint">Registered email — cannot be changed.</span>
              </div>

              <div className="profile-field profile-field-full">
                <label htmlFor="phone">Phone Number <span className="req">*</span></label>
                <div className="profile-input-wrapper">
                  <Phone size={15} className="profile-input-icon" />
                  <input id="phone" type="tel" inputMode="numeric" placeholder="10-digit mobile number"
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    autoComplete="tel" required />
                </div>
              </div>
            </div>

            {/* SECTION: Location */}
            <div className="profile-section-label">
              <MapPin size={13} /> Location
            </div>
            <div className="profile-grid">
              <div className="profile-field">
                <label htmlFor="city">City <span className="req">*</span></label>
                <div className="profile-input-wrapper">
                  <MapPin size={15} className="profile-input-icon" />
                  <input id="city" type="text" placeholder="Your city"
                    value={city} onChange={e => setCity(e.target.value)} autoComplete="address-level2" required />
                </div>
              </div>

              <div className="profile-field">
                <label htmlFor="address">Address <span className="req">*</span></label>
                <div className="profile-input-wrapper">
                  <MapPin size={15} className="profile-input-icon" />
                  <input id="address" type="text" placeholder="Area or locality"
                    value={address} onChange={e => setAddress(e.target.value)} autoComplete="street-address" required />
                </div>
              </div>
            </div>

            {/* SECTION: About */}
            <div className="profile-section-label">
              <User size={13} /> About You
            </div>
            <div className="profile-field">
              <label htmlFor="about">Bio <span className="optional">(Optional)</span></label>
              <textarea id="about" placeholder="Tell landlords and renters a little about yourself..."
                value={about} maxLength={ABOUT_MAX_LENGTH} onChange={e => setAbout(e.target.value)} rows={3} />
              <span className="profile-char-count">{about.length} / {ABOUT_MAX_LENGTH}</span>
            </div>

            {/* SUBMIT */}
            <div className="profile-submit-wrap">
              <button className="profile-submit" type="submit" disabled={saving}>
                {saving ? "Saving your profile..." : "Save & Continue"}
                {!saving && <ArrowRight size={18} />}
              </button>
              <p className="profile-submit-hint">
                Your information is encrypted and secure.
              </p>
            </div>

          </form>
        </div>
        <p className="profile-copyright">© 2026 Rently. Find a place you'll love.</p>
      </section>

    </div>
  );
}
