import React, { useState, useEffect } from "react";
import {
  Search, Home, Building2, Users, BedDouble, MapPin,
  Heart, ChevronRight, CalendarDays, User, LogOut,
  List, Menu, X, Plus, Mail, Phone, Globe, Share2,
} from "lucide-react";
import "./dashboard.css";
import { getUserProfile } from "./api";

type PropertyType = "House" | "Flat" | "PG" | "Shared";

interface Property {
  id: number;
  title: string;
  location: string;
  type: PropertyType;
  bedrooms: string;
  area: string;
  rent: number;
  status: string;
  image: string;
}

const properties: Property[] = [
  { id: 1, title: "Green Valley Villa",   location: "Patia, Bhubaneswar",           type: "House", bedrooms: "3 BHK",         area: "1800 sq ft", rent: 18000, status: "Available",     image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80" },
  { id: 2, title: "Sunrise Apartments",   location: "Kalinga Nagar, Bhubaneswar",   type: "Flat",  bedrooms: "2 BHK",         area: "1200 sq ft", rent: 14000, status: "Available",     image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=80" },
  { id: 3, title: "Samarpan PG",          location: "KIIT Square, Bhubaneswar",     type: "PG",    bedrooms: "Single / Shared", area: "300 sq ft", rent: 6000,  status: "Limited Seats", image: "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80" },
  { id: 4, title: "Lake View Flats",      location: "Rasulgarh, Bhubaneswar",       type: "Flat",  bedrooms: "2 BHK",         area: "1100 sq ft", rent: 12500, status: "Available",     image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80" },
];

const categories = [
  { name: "Houses",               description: "Spacious homes for families",        icon: Home,      cls: "cat-blue"   },
  { name: "Flats",                description: "Modern living, better lifestyle",    icon: Building2, cls: "cat-green"  },
  { name: "PGs",                  description: "Comfortable stays, great community", icon: Users,     cls: "cat-purple" },
  { name: "Shared Accommodation", description: "Share, save, live",                  icon: BedDouble, cls: "cat-pink"   },
];

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [propertyType, setPropertyType] = useState<"All" | PropertyType>("All");
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [displayName, setDisplayName] = useState("User");
  const [avatarLetter, setAvatarLetter] = useState("U");

  useEffect(() => {
    getUserProfile()
      .then(data => {
        const name = data?.fullName ?? data?.profile?.fullName ?? "";
        if (name) {
          setDisplayName(name.split(" ")[0]);        // first name only
          setAvatarLetter(name.charAt(0).toUpperCase());
        }
      })
      .catch(() => {/* silently keep defaults */});
  }, []);

  const filtered = properties.filter(p => {
    const locOk  = !searchLocation.trim() || p.location.toLowerCase().includes(searchLocation.toLowerCase());
    const typeOk = propertyType === "All" || p.type === propertyType;
    const minOk  = !minRent || p.rent >= Number(minRent);
    const maxOk  = !maxRent || p.rent <= Number(maxRent);
    return locOk && typeOk && minOk && maxOk;
  });

  const handleLogout = () => { localStorage.clear(); window.location.href = "/login"; };

  return (
    <div className="db-root">

      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <aside className={`db-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="db-sidebar-logo">
          <div className="db-logo-icon"><Home size={22} /></div>
          <span>Rently</span>
        </div>

        {/* Nav */}
        <nav className="db-sidebar-nav">
          <a href="/dashboard"   className="db-nav-item active"><Home size={19}/><span>Dashboard</span></a>
          <a href="/properties"  className="db-nav-item"><Search size={19}/><span>Explore Properties</span></a>
          <a href="/my-listings" className="db-nav-item"><List size={19}/><span>My Listings</span></a>
          <a href="/bookings"    className="db-nav-item"><CalendarDays size={19}/><span>My Bookings</span></a>
          <a href="/profile"     className="db-nav-item"><User size={19}/><span>My Profile</span></a>
          <button className="db-nav-item db-logout-item" onClick={handleLogout}>
            <LogOut size={19}/><span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="db-overlay" onClick={() => setSidebarOpen(false)}/>}

      {/* ═══════════════ MAIN AREA ═══════════════ */}
      <div className="db-main">

        {/* ── TOP HEADER ── */}
        <header className="db-header">
          {/* Mobile hamburger */}
          <button className="db-hamburger" onClick={() => setSidebarOpen(v => !v)}>
            {sidebarOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>

          {/* Header nav links (desktop) */}
          <nav className="db-header-nav">
            <a href="/dashboard"   className="db-hn-link active"><Home size={15}/>Dashboard</a>
            <a href="/properties"  className="db-hn-link"><Search size={15}/>Explore Properties</a>
            <a href="/my-listings" className="db-hn-link"><List size={15}/>My Listings</a>
            <a href="/bookings"    className="db-hn-link"><CalendarDays size={15}/>My Bookings</a>
            <a href="/profile"     className="db-hn-link"><User size={15}/>My Profile</a>
          </nav>

          {/* Right side */}
          <div className="db-header-right">
            <button className="db-list-btn"><Plus size={16}/>List Your Property</button>
            <div className="db-user-chip">
              <div className="db-user-avatar">{avatarLetter}</div>
              <span>{displayName}</span>
              <ChevronRight size={14}/>
            </div>
            <button className="db-header-logout" onClick={handleLogout} title="Logout">
              <LogOut size={18}/>
            </button>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <div className="db-content">

          {/* HERO */}
          <section className="db-hero">
            <div className="db-hero-text">
              <h1>Find Your Perfect Rental</h1>
              <p>Discover the best houses, flats and PGs in your preferred location.</p>
              <p>Your next home is just a search away.</p>
            </div>
          <div className="db-hero-img">
              <img
                src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80"
                alt=""
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          </section>

          {/* SEARCH PANEL */}
          <section className="db-search-panel">

            <div className="db-sf">
              <MapPin size={18} className="db-sf-icon"/>
              <div className="db-sf-body">
                <label>Search location</label>
                <input
                  type="text"
                  placeholder="e.g. Bhubaneswar, KIIT, Rasulgarh"
                  value={searchLocation}
                  onChange={e => setSearchLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="db-sdivider"/>

            <div className="db-sf">
              <Home size={18} className="db-sf-icon"/>
              <div className="db-sf-body">
                <label>Property Type</label>
                <div className="db-type-pills">
                  {(["House","Flat","PG"] as PropertyType[]).map(t => (
                    <button key={t} className={propertyType === t ? "active" : ""} onClick={() => setPropertyType(t)}>{t}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="db-sdivider"/>

            <div className="db-sf">
              <span className="db-rupee-icon">₹</span>
              <div className="db-sf-body">
                <label>Monthly Rent</label>
                <div className="db-rent-row">
                  <select value={minRent} onChange={e => setMinRent(e.target.value)}>
                    <option value="">Min</option>
                    {[3000,5000,8000,10000,15000,20000].map(v => <option key={v} value={v}>₹{v.toLocaleString("en-IN")}</option>)}
                  </select>
                  <span>–</span>
                  <select value={maxRent} onChange={e => setMaxRent(e.target.value)}>
                    <option value="">Max</option>
                    {[5000,10000,15000,20000,30000,50000].map(v => <option key={v} value={v}>₹{v.toLocaleString("en-IN")}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button className="db-search-btn"><Search size={18}/>Search</button>

          </section>

          {/* BROWSE BY TYPE */}
          <section className="db-section">
            <div className="db-section-head">
              <h2>Browse by Property Type</h2>
            </div>
            <div className="db-cat-grid">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button key={cat.name} className="db-cat-card" onClick={() => {
                    if (cat.name === "Houses") setPropertyType("House");
                    else if (cat.name === "Flats") setPropertyType("Flat");
                    else if (cat.name === "PGs") setPropertyType("PG");
                  }}>
                    <div className={`db-cat-icon ${cat.cls}`}><Icon size={24}/></div>
                    <div className="db-cat-body">
                      <h3>{cat.name}</h3>
                      <p>{cat.description}</p>
                    </div>
                    <ChevronRight size={18} className="db-cat-arr"/>
                  </button>
                );
              })}
            </div>
          </section>

          {/* FEATURED RENTALS */}
          <section className="db-section">
            <div className="db-section-head">
              <div>
                <h2>Featured Rentals</h2>
                <p className="db-section-sub">Handpicked properties for you</p>
              </div>
              <a href="/properties" className="db-view-all">View All <ChevronRight size={15}/></a>
            </div>

            {filtered.length === 0 ? (
              <div className="db-empty">
                <Search size={36}/>
                <h3>No properties found</h3>
                <p>Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="db-prop-grid">
                {filtered.map(p => (
                  <article className="db-prop-card" key={p.id}>
                    <div className="db-prop-img">
                      <img src={p.image} alt={p.title}/>
                      <span className={`db-badge ${p.status === "Limited Seats" ? "limited" : ""}`}>{p.status}</span>
                      <button className="db-fav" aria-label="Save"><Heart size={16}/></button>
                    </div>
                    <div className="db-prop-info">
                      <h3>{p.title}</h3>
                      <div className="db-prop-loc"><MapPin size={13}/>{p.location}</div>
                      <div className="db-prop-meta">
                        <span>{p.type === "House" ? <Home size={13}/> : p.type === "Flat" ? <Building2 size={13}/> : <Users size={13}/>}{p.type}</span>
                        <span><BedDouble size={13}/>{p.bedrooms}</span>
                        <span>{p.area}</span>
                      </div>
                      <div className="db-prop-price">₹{p.rent.toLocaleString("en-IN")}<small> / month</small></div>
                      <button className="db-details-btn">View Details <ChevronRight size={15}/></button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <footer className="db-footer">
          <div className="db-footer-grid">

            {/* Brand */}
            <div className="db-fc db-fc-brand">
              <div className="db-footer-logo">
                <div className="db-fl-icon"><Home size={18}/></div>
                <span>Rently</span>
              </div>
              <p>India's trusted platform for finding rental homes, flats and PGs. Your next chapter starts here.</p>
              <div className="db-socials">
                <a href="#" aria-label="Facebook">f</a>
                <a href="#" aria-label="Twitter">𝕏</a>
                <a href="#" aria-label="Instagram">Ig</a>
                <a href="#" aria-label="LinkedIn">in</a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="db-fc">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/properties">Explore Properties</a></li>
                <li><a href="/my-listings">My Listings</a></li>
                <li><a href="/bookings">My Bookings</a></li>
                <li><a href="/profile">My Profile</a></li>
              </ul>
            </div>

            {/* Property Types */}
            <div className="db-fc">
              <h4>Property Types</h4>
              <ul>
                <li><a href="#">Houses</a></li>
                <li><a href="#">Flats</a></li>
                <li><a href="#">PGs</a></li>
                <li><a href="#">Shared Accommodation</a></li>
                <li><a href="#">View All</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="db-fc">
              <h4>Contact Us</h4>
              <ul className="db-contact-list">
                <li><MapPin size={13}/><span>Bhubaneswar, Odisha, India</span></li>
                <li><Phone size={13}/><span>+91 98765 43210</span></li>
                <li><Mail size={13}/><span>support@rently.in</span></li>
                <li><Globe size={13}/><span>www.rently.in</span></li>
              </ul>
            </div>

          </div>

          <div className="db-footer-bar">
            <span>© 2026 Rently Technologies Pvt. Ltd. All rights reserved.</span>
            <div className="db-footer-links">
              <a href="#">Privacy Policy</a><span>·</span>
              <a href="#">Terms of Service</a><span>·</span>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </footer>

      </div>{/* /db-main */}
    </div>
  );
};

export default Dashboard;
