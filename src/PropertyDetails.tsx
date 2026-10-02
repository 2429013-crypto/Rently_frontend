import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Home,
  Building2,
  Users,
  BedDouble,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  ShieldAlert,
  X,
} from "lucide-react";
import {
  getPropertyById,
  getCurrentUser,
  updatePropertyApi,
  deletePropertyApi,
} from "./api";
import type { BackendProperty } from "./api";

import "./PropertyDetails.css";
import "./MyListings.css";

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [property, setProperty] = useState<BackendProperty | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    type: "Flat" as "House" | "Flat" | "PG" | "Shared",
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
    available: true,
  });
  const [updating, setUpdating] = useState(false);

  const loadDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      setActionError(null);

      // Fetch current user (if logged in)
      const userRes = await getCurrentUser().catch(() => null);
      if (userRes?.user?.id || userRes?.userId) {
        setCurrentUserId(Number(userRes.user?.id || userRes.userId));
      }

      // Fetch property details
      const res = await getPropertyById(id);
      if (res?.success && res?.property) {
        setProperty(res.property);
      } else {
        setError("Property not found.");
      }
    } catch (err) {
      console.error("Load property details error:", err);
      setError(err instanceof Error ? err.message : "Failed to load property details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  const isOwner = Boolean(
    currentUserId && property && Number(currentUserId) === Number(property.ownerId)
  );

  const handleToggleAvailability = async () => {
    if (!property || !isOwner) return;
    setActionError(null);
    try {
      setToggling(true);
      const newStatus = !property.available;
      const res = await updatePropertyApi(property.id, { available: newStatus });
      if (res?.property) {
        setProperty(res.property);
      } else {
        setProperty(prev => (prev ? { ...prev, available: newStatus } : null));
      }
      alert(`Property status updated to: ${newStatus ? "Available" : "Currently Unavailable"}`);
    } catch (err) {
      if (err instanceof Error && err.message.includes("Forbidden")) {
        setActionError("You are not authorized to modify this property.");
      } else {
        setActionError(err instanceof Error ? err.message : "Failed to change availability.");
      }
    } finally {
      setToggling(false);
    }
  };

  const handleOpenEdit = () => {
    if (!property) return;
    setEditForm({
      title: property.title || "",
      type: property.type || "Flat",
      city: property.city || "",
      address: property.address || "",
      bedrooms: property.bedrooms ? String(property.bedrooms) : "",
      bathrooms: property.bathrooms ? String(property.bathrooms) : "",
      area: property.area || "",
      rent: property.rent ? String(property.rent) : "",
      deposit: property.deposit ? String(property.deposit) : "",
      furnishing: property.furnishing || "Semi-Furnished",
      description: property.description || "",
      image: property.image || "",
      available: property.available !== false,
    });
    setActionError(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !isOwner) return;
    setActionError(null);

    try {
      setUpdating(true);
      const res = await updatePropertyApi(property.id, {
        title: editForm.title,
        type: editForm.type,
        city: editForm.city,
        address: editForm.address,
        bedrooms: editForm.bedrooms ? Number(editForm.bedrooms) : null,
        bathrooms: editForm.bathrooms ? Number(editForm.bathrooms) : null,
        area: editForm.area || null,
        rent: Number(editForm.rent),
        deposit: editForm.deposit ? Number(editForm.deposit) : null,
        furnishing: editForm.furnishing || null,
        description: editForm.description || "",  
        image: editForm.image || null,
        available: editForm.available,
      });

      if (res?.property) {
        setProperty(res.property);
      }
      alert("Property updated successfully!");
      setShowEditModal(false);
    } catch (err) {
      if (err instanceof Error && err.message.includes("Forbidden")) {
        setActionError("You are not authorized to modify this property.");
      } else {
        setActionError(err instanceof Error ? err.message : "Failed to update property.");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!property || !isOwner) return;
    if (!window.confirm("Are you sure you want to delete this property?")) return;

    setActionError(null);
    try {
      await deletePropertyApi(property.id);
      alert("Property deleted successfully!");
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof Error && err.message.includes("Forbidden")) {
        setActionError("You are not authorized to modify this property.");
      } else {
        setActionError(err instanceof Error ? err.message : "Failed to delete property.");
      }
    }
  };

  if (loading) {
    return (
      <div className="pd-root">
        <div className="pd-header-banner">
          <div className="pd-header-container">
            <button className="pd-back-btn" onClick={() => navigate("/dashboard")}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </div>
        </div>
        <div className="pd-content-container">
          <div className="pd-main-card" style={{ padding: "60px 20px", textAlign: "center" }}>
            <p style={{ color: "#64748b", fontSize: "16px" }}>Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="pd-root">
        <div className="pd-header-banner">
          <div className="pd-header-container">
            <button className="pd-back-btn" onClick={() => navigate("/dashboard")}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </div>
        </div>
        <div className="pd-content-container">
          <div className="pd-main-card" style={{ padding: "60px 20px", textAlign: "center" }}>
            <ShieldAlert size={42} style={{ color: "#ef4444", marginBottom: "12px" }} />
            <h2 style={{ color: "#0d1f30", margin: "0 0 8px" }}>{error || "Property Not Found"}</h2>
            <p style={{ color: "#64748b" }}>The property listing you are looking for does not exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  const locationStr = property.address && property.city ? `${property.address}, ${property.city}` : property.address || property.city || "Location not specified";
  const displayImage = property.image || "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80";
  const isAvailable = property.available !== false;

  return (
    <div className="pd-root">
      {/* HEADER BANNER */}
      <div className="pd-header-banner">
        <div className="pd-header-container">
          <button className="pd-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="pd-content-container">
        {actionError && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "14px 18px",
              borderRadius: "12px",
              marginBottom: "20px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <ShieldAlert size={18} />
            {actionError}
          </div>
        )}

        <div className="pd-main-card">
          {/* IMAGE */}
          <div className="pd-hero-img-wrap">
            <img
              src={displayImage}
              alt={property.title}
              onError={e => {
                (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80";
              }}
            />
            <div className="pd-badge-row">
              <span className="pd-badge">{property.type}</span>
              <span className={`pd-badge ${isAvailable ? "available" : "unavailable"}`}>
                {isAvailable ? "Available" : "Currently Unavailable"}
              </span>
            </div>
          </div>

          {/* BODY */}
          <div className="pd-body">
            <div className="pd-title-price-row">
              <div>
                <h1>{property.title}</h1>
                <div className="pd-location">
                  <MapPin size={16} /> {locationStr}
                </div>
              </div>

              <div className="pd-price-box">
                <div className="pd-price">
                  ₹{Number(property.rent).toLocaleString("en-IN")}
                  <small> / month</small>
                </div>
                {property.deposit && (
                  <div className="pd-deposit">
                    Deposit: ₹{Number(property.deposit).toLocaleString("en-IN")}
                  </div>
                )}
              </div>
            </div>

            {/* SPECS GRID */}
            <div className="pd-specs-grid">
              <div className="pd-spec-item">
                <span className="pd-spec-label">Bedrooms</span>
                <span className="pd-spec-val">
                  {property.bedrooms ? `${property.bedrooms} BHK` : "N/A"}
                </span>
              </div>

              <div className="pd-spec-item">
                <span className="pd-spec-label">Bathrooms</span>
                <span className="pd-spec-val">
                  {property.bathrooms ? `${property.bathrooms} Baths` : "N/A"}
                </span>
              </div>

              <div className="pd-spec-item">
                <span className="pd-spec-label">Carpet Area</span>
                <span className="pd-spec-val">{property.area || "N/A"}</span>
              </div>

              <div className="pd-spec-item">
                <span className="pd-spec-label">Furnishing</span>
                <span className="pd-spec-val">{property.furnishing || "Unspecified"}</span>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="pd-section">
              <h2 className="pd-section-h2">Property Description</h2>
              <p className="pd-description">
                {property.description || "No description provided by owner."}
              </p>
            </div>

            {/* OWNER VS PUBLIC VIEW */}
            {isOwner ? (
              <div className="pd-owner-panel">
                <h3 className="pd-owner-panel-title">
                  <Building2 size={18} /> Owner Control Panel (You own this listing)
                </h3>

                <div className="pd-owner-actions">
                  <button
                    type="button"
                    className={`pd-toggle-btn ${isAvailable ? "make-unavail" : "make-avail"}`}
                    onClick={handleToggleAvailability}
                    disabled={toggling}
                  >
                    {isAvailable ? (
                      <>
                        <XCircle size={16} /> Mark as Currently Unavailable
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} /> Mark as Available
                      </>
                    )}
                  </button>

                  <button type="button" className="pd-edit-btn" onClick={handleOpenEdit}>
                    <Edit size={16} /> Edit Property
                  </button>

                  <button type="button" className="pd-delete-btn" onClick={handleDelete}>
                    <Trash2 size={16} /> Delete Property
                  </button>
                </div>
              </div>
            ) : (
              <div className="pd-public-chip">
                <div>
                  <p>
                    Listed by verified owner. Interested in renting this property?
                  </p>
                  {property.User?.email && (
                    <p style={{ marginTop: "4px", fontSize: "13px" }}>
                      Owner Contact: <strong>{property.User?.email}</strong>
                    </p>
                  )}

                </div>

                <div
                  style={{
                    background: "#087df5",
                    color: "white",
                    padding: "10px 18px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                >
                  Verified Listing
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODAL FOR OWNER */}
      {showEditModal && isOwner && (
        <div className="ml-modal-overlay">
          <div className="ml-modal-card">
            <div className="ml-modal-header">
              <h2>Edit Property Details</h2>
              <button
                type="button"
                className="ml-close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="ap-grid-2" style={{ marginBottom: "16px" }}>
                <div className="ap-field">
                  <label>Property Title *</label>
                  <input
                    className="ap-input"
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="ap-field">
                  <label>Property Type *</label>
                  <select
                    className="ap-select"
                    value={editForm.type}
                    onChange={e => setEditForm({ ...editForm, type: e.target.value as any })}
                  >
                    <option value="House">House</option>
                    <option value="Flat">Flat</option>
                    <option value="PG">PG</option>
                    <option value="Shared">Shared</option>
                  </select>
                </div>
              </div>

              <div className="ap-grid-2" style={{ marginBottom: "16px" }}>
                <div className="ap-field">
                  <label>City *</label>
                  <input
                    className="ap-input"
                    value={editForm.city}
                    onChange={e => setEditForm({ ...editForm, city: e.target.value })}
                    required
                  />
                </div>

                <div className="ap-field">
                  <label>Address *</label>
                  <input
                    className="ap-input"
                    value={editForm.address}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="ap-grid-3" style={{ marginBottom: "16px" }}>
                <div className="ap-field">
                  <label>Bedrooms</label>
                  <input
                    type="number"
                    className="ap-input"
                    value={editForm.bedrooms}
                    onChange={e => setEditForm({ ...editForm, bedrooms: e.target.value })}
                  />
                </div>

                <div className="ap-field">
                  <label>Bathrooms</label>
                  <input
                    type="number"
                    className="ap-input"
                    value={editForm.bathrooms}
                    onChange={e => setEditForm({ ...editForm, bathrooms: e.target.value })}
                  />
                </div>

                <div className="ap-field">
                  <label>Carpet Area</label>
                  <input
                    className="ap-input"
                    value={editForm.area}
                    onChange={e => setEditForm({ ...editForm, area: e.target.value })}
                  />
                </div>
              </div>

              <div className="ap-grid-3" style={{ marginBottom: "16px" }}>
                <div className="ap-field">
                  <label>Monthly Rent (₹) *</label>
                  <input
                    type="number"
                    className="ap-input"
                    value={editForm.rent}
                    onChange={e => setEditForm({ ...editForm, rent: e.target.value })}
                    required
                  />
                </div>

                <div className="ap-field">
                  <label>Security Deposit (₹)</label>
                  <input
                    type="number"
                    className="ap-input"
                    value={editForm.deposit}
                    onChange={e => setEditForm({ ...editForm, deposit: e.target.value })}
                  />
                </div>

                <div className="ap-field">
                  <label>Furnishing</label>
                  <select
                    className="ap-select"
                    value={editForm.furnishing}
                    onChange={e => setEditForm({ ...editForm, furnishing: e.target.value })}
                  >
                    <option value="Furnished">Furnished</option>
                    <option value="Semi-Furnished">Semi-Furnished</option>
                    <option value="Unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>

              <div className="ap-field" style={{ marginBottom: "16px" }}>
                <label>Availability Status</label>
                <select
                  className="ap-select"
                  value={editForm.available ? "true" : "false"}
                  onChange={e => setEditForm({ ...editForm, available: e.target.value === "true" })}
                >
                  <option value="true">Available for Rent</option>
                  <option value="false">Currently Unavailable</option>
                </select>
              </div>

              <div className="ap-field" style={{ marginBottom: "16px" }}>
                <label>Property Image URL</label>
                <input
                  className="ap-input"
                  value={editForm.image}
                  onChange={e => setEditForm({ ...editForm, image: e.target.value })}
                />
              </div>

              <div className="ap-field" style={{ marginBottom: "20px" }}>
                <label>Description</label>
                <textarea
                  className="ap-textarea"
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                />
              </div>

              <button type="submit" className="ap-submit-btn" disabled={updating}>
                {updating ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
