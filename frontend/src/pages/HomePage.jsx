import { Link } from "react-router-dom";
import { clearSession, getStoredSession } from "../utils/auth";

const dashboardCards = [
  {
    title: "Customer Dashboard",
    description: "Customer profile creation, new applications, KYC upload tracking and status view.",
    to: "/customer",
    icon: "bi-person-circle",
    color: "primary"
  },
  {
    title: "Underwriter Dashboard",
    description: "Review applications, inspect scores, record decisions and maintain underwriting history.",
    to: "/underwriter",
    icon: "bi-clipboard-data",
    color: "warning"
  },
  {
    title: "Operations Dashboard",
    description: "Manage card issuance, account setup, statements, payments and transaction monitoring.",
    to: "/operations",
    icon: "bi-gear-wide-connected",
    color: "success"
  },
  {
    title: "Admin Dashboard",
    description: "Control users, roles, products, fee setup and a system-wide audit view.",
    to: "/admin",
    icon: "bi-shield-lock",
    color: "info"
  }
];

function HomePage() {
  const session = getStoredSession();

  return (
    <div className="landing-page">
      <div className="landing-hero shadow-sm">
        <div className="row align-items-center">
          <div className="col-lg-7">
            <p className="text-uppercase fw-semibold small mb-2 text-primary">
              CardMaster Frontend
            </p>
            <h1 className="display-5 fw-bold mb-3">
              Credit Card Issuance, Transactions and Risk Management UI
            </h1>
            <p className="lead text-muted mb-4">
              This React + Vite frontend gives you 4 dashboards and 19 beginner-friendly pages
              aligned with your Spring Boot backend modules.
            </p>
            <div className="d-flex flex-wrap gap-2">
              {session ? (
                <>
                  <Link to="/home" className="btn btn-primary btn-lg">
                    Stay On Overview
                  </Link>
                  <Link to="/admin" className="btn btn-outline-dark btn-lg">
                    Open Admin Dashboard
                  </Link>
                  <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={() => {
                      clearSession();
                      window.location.reload();
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-primary btn-lg">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-outline-dark btn-lg">
                    Register
                  </Link>
                </>
              )}
            </div>
            {session ? (
              <div className="alert alert-light border mt-4 mb-0">
                Logged in as <strong>{session.email}</strong>
              </div>
            ) : null}
          </div>
          <div className="col-lg-5">
            <div className="row g-3 mt-3 mt-lg-0">
              {["Profiles", "Underwriting", "Card Ops", "Statements"].map((item) => (
                <div className="col-6" key={item}>
                  <div className="mini-tile">
                    <span>{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        {dashboardCards.map((card) => (
          <div className="col-lg-6" key={card.title}>
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <div className={`icon-chip bg-${card.color}-subtle text-${card.color}`}>
                  <i className={`bi ${card.icon}`}></i>
                </div>
                <h3 className="h4 mt-3">{card.title}</h3>
                <p className="text-muted">{card.description}</p>
                <Link to={card.to} className="btn btn-outline-primary">
                  View Pages
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
