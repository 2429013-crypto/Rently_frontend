import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Home,
  Building2,
  Users,
  BedDouble,
  X,
} from "lucide-react";
import {
  getMyProperties,
  updatePropertyApi,
  deletePropertyApi,
} from "./api";
import type { BackendProperty } from "./api";

import "./MyListings.css";

const MyListings: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<BackendProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [editingProp, setEditingProp] = useState<BackendProperty | null>(null);
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
  const [editError, setEditError] = useState("");

  const loadMyListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyProperties();
      if (res?.success && Array.isArray(res?.properties)) {
        setProperties(res.properties);
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.error("Fetch my properties error:", err);
      setError(err instanceof Error ? err.message : "Failed to load your properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyListings();
  }, []);

  const handleOpenEdit = (p: BackendProperty) => {
    setEditingProp(p);
    setEditForm({
      title: p.title || "",
      type: p.type || "Flat",
      city: p.city || "",
      address: p.address || "",
      bedrooms: p.bedrooms ? String(p.bedrooms) : "",
      bathrooms: p.bathrooms ? String(p.bathrooms) : "",
      area: p.area || "",
      rent: p.rent ? String(p.rent) : "",
      deposit: p.deposit ? String(p.deposit) : "",
      furnishing: p.furnishing || "Semi-Furnished",
      description: p.description || "",
      image: p.image || "",
      available: p.available !== false,
    });
    setEditError("");
  };

  const handleCloseEdit = () => {
    setEditingProp(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProp) return;
    setEditError("");

    if (!editForm.title || !editForm.type || !editForm.city || !editForm.address || !editForm.rent) {
      setEditError("Please fill in all required fields (Title, Type, City, Address, Rent).");
      return;
    }

    try {
      setUpdating(true);
      await updatePropertyApi(editingProp.id, {
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
        description: editForm.description || null,
        image: editForm.image || null,
        available: editForm.available,
      });

      alert("Property updated successfully!");
      handleCloseEdit();
      loadMyListings();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update property.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this property listing?")) return;
    try {
      await deletePropertyApi(id);
      alert("Property deleted successfully!");
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete property.");
    }
  };

  return (
    <div className="ml-root">
      {/* HEADER BANNER */}
      <div className="ml-header-banner">
        <div className="ml-header-container">
          <div className="ml-top-bar">
            <button
              type="button"
              className="ml-back-btn"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <button
              type="button"
              className="ml-add-btn"
              onClick={() => navigate("/add-property")}
            >
              <Plus size={16} /> List New Property
            </button>
          </div>

          <div className="ml-title-wrap">
            <h1>My Listed Properties</h1>
            <p>Manage and edit the rental properties you have listed on Rently.</p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="ml-content-container">
        {loading ? (
          <div className="ml-empty-card">
            <p style={{ color: "#64748b", fontSize: "16px" }}>Loading your properties...</p>
          </div>
        ) : error ? (
          <div className="ml-empty-card">
            <p style={{ color: "#ef4444", fontSize: "16px" }}>{error}</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="ml-empty-card">
            <Home size={42} style={{ color: "#087df5" }} />
            <h3>You haven't listed any properties yet.</h3>
            <p>Start listing your rental homes or flats to reach potential tenants.</p>
            <button
              type="button"
              className="ml-add-btn"
              style={{ margin: "0 auto" }}
              onClick={() => navigate("/add-property")}
            >
              <Plus size={16} /> List Your First Property
            </button>
          </div>
        ) : (
          <div className="ml-grid">
            {properties.map(p => {
              const locationStr = p.address && p.city ? `${p.address}, ${p.city}` : p.address || p.city || "Location not specified";
              const statusStr = p.available !== false ? "Available" : "Unavailable";
              const displayImage = p.image || "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80";

              return (
                <div className="ml-card" key={p.id}>
                  <div className="ml-card-img-wrap" onClick={() => navigate(`/property/${p.id}`)} style={{ cursor: "pointer" }}>
                    <img
                      src={displayImage}
                      alt={p.title}
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80";
                      }}
                    />
                    <span className={`ml-badge ${!p.available ? "unavailable" : ""}`}>
                      {p.available !== false ? "Available" : "Currently Unavailable"}
                    </span>
                  </div>

                  <div className="ml-card-body">
                    <h3 className="ml-card-title" onClick={() => navigate(`/property/${p.id}`)} style={{ cursor: "pointer" }}>{p.title}</h3>

                    <div className="ml-card-loc">
                      <MapPin size={14} /> {locationStr}
                    </div>

                    <div className="ml-card-specs">
                      <span>{p.type}</span>
                      <span>•</span>
                      <span>{p.bedrooms ? `${p.bedrooms} BHK` : "N/A"}</span>
                      {p.area && (
                        <>
                          <span>•</span>
                          <span>{p.area}</span>
                        </>
                      )}
                    </div>

                    <div className="ml-card-price">
                      ₹{Number(p.rent).toLocaleString("en-IN")}<small> / month</small>
                    </div>

                    <div className="ml-card-actions">
                      <button
                        type="button"
                        className="ml-btn-edit"
                        onClick={() => handleOpenEdit(p)}
                      >
                        <Edit size={15} /> Edit Details
                      </button>

                      <button
                        type="button"
                        className="ml-btn-delete"
                        onClick={() => handleDelete(p.id)}
                        title="Delete Property"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editingProp && (
        <div className="ml-modal-overlay">
          <div className="ml-modal-card">
            <div className="ml-modal-header">
              <h2>Edit Property Details</h2>
              <button type="button" className="ml-close-btn" onClick={handleCloseEdit}>
                <X size={20} />
              </button>
            </div>

            {editError && <div className="ap-error-alert">{editError}</div>}

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
                  <option value="false">Currently Rented / Unavailable</option>
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

export default MyListings;
