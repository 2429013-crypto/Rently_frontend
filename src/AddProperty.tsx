import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Sparkles,
  DollarSign,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import "./AddProperty.css";

function AddProperty() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    type: "Flat",
    city: "",
    address: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    rent: "",
    deposit: "",
    furnishing: "Semi-Furnished",
    description: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (
      !form.title ||
      !form.type ||
      !form.city ||
      !form.address ||
      !form.rent
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/properties",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: form.title,
            type: form.type,
            city: form.city,
            address: form.address,
            bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
            bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
            area: form.area || null,
            rent: Number(form.rent),
            deposit: form.deposit ? Number(form.deposit) : null,
            furnishing: form.furnishing || null,
            description: form.description || null,
            image: form.image || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create property"
        );
      }

      alert("Property listed successfully!");

      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create property"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ap-root">
      {/* HEADER BANNER */}
      <div className="ap-header-banner">
        <div className="ap-header-container">
          <button
            type="button"
            className="ap-back-btn"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div className="ap-title-wrap">
            <h1>List Your Property</h1>
            <p>Add your rental property to Rently and reach verified tenants.</p>
          </div>
        </div>
      </div>

      {/* FORM CONTAINER */}
      <div className="ap-card-container">
        <div className="ap-card">
          {error && <div className="ap-error-alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* SECTION 1: BASIC INFORMATION */}
            <div className="ap-form-section">
              <div className="ap-section-title">
                <Building2 size={18} /> Basic Information
              </div>
              <div className="ap-grid-2">
                <div className="ap-field">
                  <label htmlFor="title">
                    Property Title <span className="req">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    className="ap-input"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Modern 2BHK Apartment near KIIT"
                    required
                  />
                </div>

                <div className="ap-field">
                  <label htmlFor="type">
                    Property Type <span className="req">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    className="ap-select"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option value="House">House</option>
                    <option value="Flat">Flat</option>
                    <option value="PG">PG</option>
                    <option value="Shared">Shared</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: LOCATION */}
            <div className="ap-form-section">
              <div className="ap-section-title">
                <MapPin size={18} /> Location Details
              </div>
              <div className="ap-grid-2">
                <div className="ap-field">
                  <label htmlFor="city">
                    City <span className="req">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    className="ap-input"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="e.g. Bhubaneswar"
                    required
                  />
                </div>

                <div className="ap-field">
                  <label htmlFor="address">
                    Address / Locality <span className="req">*</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    className="ap-input"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="e.g. Patia, near KIIT Square"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: SPECIFICATIONS */}
            <div className="ap-form-section">
              <div className="ap-section-title">
                <Sparkles size={18} /> Property Specifications
              </div>
              <div className="ap-grid-3">
                <div className="ap-field">
                  <label htmlFor="bedrooms">
                    Bedrooms <span className="opt">(Optional)</span>
                  </label>
                  <input
                    id="bedrooms"
                    type="number"
                    name="bedrooms"
                    className="ap-input"
                    value={form.bedrooms}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g. 2"
                  />
                </div>

                <div className="ap-field">
                  <label htmlFor="bathrooms">
                    Bathrooms <span className="opt">(Optional)</span>
                  </label>
                  <input
                    id="bathrooms"
                    type="number"
                    name="bathrooms"
                    className="ap-input"
                    value={form.bathrooms}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g. 2"
                  />
                </div>

                <div className="ap-field">
                  <label htmlFor="area">
                    Carpet Area <span className="opt">(Optional)</span>
                  </label>
                  <input
                    id="area"
                    name="area"
                    className="ap-input"
                    value={form.area}
                    onChange={handleChange}
                    placeholder="e.g. 1200 sq ft"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: PRICING & FURNISHING */}
            <div className="ap-form-section">
              <div className="ap-section-title">
                <DollarSign size={18} /> Pricing & Furnishing
              </div>
              <div className="ap-grid-3">
                <div className="ap-field">
                  <label htmlFor="rent">
                    Monthly Rent (₹) <span className="req">*</span>
                  </label>
                  <input
                    id="rent"
                    type="number"
                    name="rent"
                    className="ap-input"
                    value={form.rent}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g. 15000"
                    required
                  />
                </div>

                <div className="ap-field">
                  <label htmlFor="deposit">
                    Security Deposit (₹) <span className="opt">(Optional)</span>
                  </label>
                  <input
                    id="deposit"
                    type="number"
                    name="deposit"
                    className="ap-input"
                    value={form.deposit}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g. 30000"
                  />
                </div>

                <div className="ap-field">
                  <label htmlFor="furnishing">Furnishing Status</label>
                  <select
                    id="furnishing"
                    name="furnishing"
                    className="ap-select"
                    value={form.furnishing}
                    onChange={handleChange}
                  >
                    <option value="Furnished">Furnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 5: MEDIA & DESCRIPTION */}
            <div className="ap-form-section">
              <div className="ap-section-title">
                <FileText size={18} /> Media & Details
              </div>
              <div className="ap-field" style={{ marginBottom: "20px" }}>
                <label htmlFor="image">
                  Property Image URL <span className="opt">(Optional)</span>
                </label>
                <input
                  id="image"
                  name="image"
                  className="ap-input"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/photo-..."
                />
                <span className="ap-hint">
                  Provide a web image URL to highlight your property listing.
                </span>
              </div>

              <div className="ap-field">
                <label htmlFor="description">
                  Description <span className="opt">(Optional)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="ap-textarea"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe key highlights of the property (e.g. 24/7 security, balcony view, near transport)..."
                  rows={4}
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button type="submit" className="ap-submit-btn" disabled={loading}>
              {loading ? "Listing Property..." : "List Property"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProperty;
