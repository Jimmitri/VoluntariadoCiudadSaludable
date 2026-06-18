import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/config";

function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const q = query(
          collection(db, "campaigns"),
          where("status", "==", "activa")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCampaigns(data);
      } catch (err) {
        console.error("Error cargando campañas:", err);
        setError("No se pudieron cargar las campañas. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const filtered = campaigns.filter((camp) => {
    const term = searchTerm.toLowerCase();
    return (
      (camp.nombre || "").toLowerCase().includes(term) ||
      (camp.ubicacion || "").toLowerCase().includes(term)
    );
  });

  const formatDate = (date) => {
    if (!date) return "Fecha no disponible";
    if (date.toDate) {
      const d = date.toDate();
      return d.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
    }
    if (typeof date === "string") return date;
    try {
      const d = new Date(date);
      if (!isNaN(d)) return d.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
    } catch (_) {}
    return "Fecha no disponible";
  };

  return (
    <main className="campaigns-page">
      <section className="campaigns-header">
        <span className="hero-badge">🌿 Voluntariado</span>
        <h1>Campañas <span>activas</span></h1>
        <p>Explora nuestras iniciativas ambientales y encuentra la que mejor se adapte a ti.</p>
      </section>

      <section className="campaigns-search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm("")} aria-label="Limpiar búsqueda">✕</button>
          )}
        </div>
      </section>

      <section className="campaigns-content">
        {loading && (
          <div className="campaigns-feedback">
            <p className="loading-message">⏳ Cargando campañas...</p>
          </div>
        )}

        {!loading && error && (
          <div className="campaigns-feedback">
            <p className="error-message">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="campaigns-feedback">
            <p className="empty-message">
              {searchTerm ? `No se encontraron campañas para "${searchTerm}".` : "No hay campañas activas en este momento."}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="campaigns-count">
              {filtered.length} campaña{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="campaigns-grid">
              {filtered.map((camp) => (
                <article key={camp.id} className="campaign-card">

                  {/* ── Imagen de la campaña ── */}
                  {camp.imagen ? (
                    <div className="campaign-card-img">
                      <img src={camp.imagen} alt={camp.nombre} />
                    </div>
                  ) : (
                    <div className="campaign-card-img campaign-card-img--placeholder">
                      <span>🌿</span>
                    </div>
                  )}

                  <div className="campaign-card-body">
                    <span className="campaign-status-badge">✅ Activa</span>
                    <h2 className="campaign-card-title">{camp.nombre}</h2>

                    <div className="campaign-card-meta">
                      <div className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span>{formatDate(camp.fecha)}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">📍</span>
                        <span>{camp.ubicacion || "Ubicación no especificada"}</span>
                      </div>
                      {camp.vacantes !== undefined && (
                        <div className="meta-item">
                          <span className="meta-icon">👥</span>
                          <span>{camp.vacantes} vacante{camp.vacantes !== 1 ? "s" : ""} disponible{camp.vacantes !== 1 ? "s" : ""}</span>
                        </div>
                      )}
                    </div>

                    {camp.descripcion && (
                      <p className="campaign-card-desc">
                        {camp.descripcion.length > 120 ? camp.descripcion.slice(0, 120) + "…" : camp.descripcion}
                      </p>
                    )}
                  </div>

                  <div className="campaign-card-footer">
                    <Link to={`/campaign/${camp.id}`} className="campaign-detail-btn">
                      Ver detalle →
                    </Link>
                  </div>

                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <style>{`
        .campaigns-page {
          min-height: calc(100vh - 72px);
          background: linear-gradient(180deg, #f2f7f2 0%, #ffffff 100%);
        }
        .campaigns-header {
          padding: 60px 80px 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .campaigns-header h1 {
          font-size: 44px;
          font-weight: 900;
          color: #102015;
          letter-spacing: -1px;
          line-height: 1.1;
          margin: 0;
        }
        .campaigns-header h1 span { color: #2e7d32; }
        .campaigns-header p {
          color: #26352b;
          font-size: 17px;
          line-height: 1.6;
          max-width: 560px;
          margin: 0;
        }
        .campaigns-search-bar { padding: 32px 80px 0; }
        .search-input-wrapper {
          position: relative;
          max-width: 520px;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 16px;
          font-size: 16px;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          padding: 14px 44px 14px 46px;
          border: 1.5px solid #d4ded6;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          background: white;
          color: #102015;
          transition: border-color 0.2s;
        }
        .search-input:focus {
          border-color: #2e7d32;
          box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
        }
        .search-clear {
          position: absolute;
          right: 14px;
          background: #e8f5e9;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 12px;
          font-weight: 700;
          color: #2e7d32;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .campaigns-content { padding: 28px 80px 60px; }
        .campaigns-count {
          font-size: 14px;
          font-weight: 700;
          color: #526058;
          margin-bottom: 20px;
        }
        .campaigns-feedback { padding: 40px 0; }
        .loading-message, .empty-message {
          color: #526058;
          background: #f4f8f4;
          padding: 18px 22px;
          border-radius: 12px;
          font-size: 15px;
        }
        .campaigns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
          gap: 22px;
        }
        .campaign-card {
          background: white;
          border-radius: 18px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          overflow: hidden;
          border: 1px solid #eef5ef;
        }
        .campaign-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.1);
        }
        .campaign-card-img {
          width: 100%;
          height: 160px;
          overflow: hidden;
        }
        .campaign-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .campaign-card:hover .campaign-card-img img {
          transform: scale(1.05);
        }
        .campaign-card-img--placeholder {
          background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }
        .campaign-card-body {
          padding: 22px 26px 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }
        .campaign-status-badge {
          width: fit-content;
          background: #e8f5e9;
          color: #2e7d32;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
        }
        .campaign-card-title {
          font-size: 19px;
          font-weight: 900;
          color: #073b20;
          line-height: 1.25;
          margin: 0;
        }
        .campaign-card-meta {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #3f4f43;
        }
        .meta-icon { font-size: 15px; flex-shrink: 0; }
        .campaign-card-desc {
          font-size: 14px;
          color: #526058;
          line-height: 1.55;
          margin: 0;
        }
        .campaign-card-footer { padding: 0 26px 22px; }
        .campaign-detail-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 12px 22px;
          background: #2e7d32;
          color: white;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 800;
          transition: background 0.18s ease;
        }
        .campaign-detail-btn:hover { background: #256b29; }
        @media (max-width: 1000px) {
          .campaigns-header,
          .campaigns-search-bar,
          .campaigns-content { padding-left: 24px; padding-right: 24px; }
          .campaigns-header { padding-top: 40px; }
          .campaigns-header h1 { font-size: 32px; }
          .search-input-wrapper { max-width: 100%; }
          .campaigns-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}

export default Campaigns;
