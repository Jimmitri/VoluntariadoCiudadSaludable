import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import AdminLayout from "../components/AdminLayout";

function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);

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
    <AdminLayout>
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
                    <button
                      className="campaign-detail-btn"
                      onClick={() => setSelectedCampaign(camp)}
                    >
                      Ver detalle →
                    </button>
                  </div>

                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {selectedCampaign && (
        <div className="modal-overlay" onClick={() => setSelectedCampaign(null)}>
          <div className="campaign-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedCampaign(null)}>
              ✕
            </button>

            {selectedCampaign.imagen ? (
              <img
                src={selectedCampaign.imagen}
                alt={selectedCampaign.nombre}
                className="modal-image"
              />
            ) : (
              <div className="modal-image modal-placeholder">🌿</div>
            )}

            <div className="modal-content">
              <span className="campaign-status-badge">✅ Activa</span>

              <h2>{selectedCampaign.nombre}</h2>

              <div className="modal-info">
                <p>📅 {formatDate(selectedCampaign.fecha)}</p>
                <p>📍 {selectedCampaign.ubicacion || "Ubicación no especificada"}</p>
                <p>
                  👥 {selectedCampaign.vacantes ?? "—"} vacantes disponibles
                </p>
              </div>

              <h3>Sobre esta campaña</h3>
              <p>
                {selectedCampaign.descripcion ||
                  "No se ha proporcionado una descripción para esta campaña."}
              </p>

              <h3>Requisitos</h3>
              <p>
                {selectedCampaign.requisitos ||
                  "No hay requisitos específicos para esta campaña."}
              </p>

            </div>
          </div>
        </div>
      )}
    </main>
    </AdminLayout>
  );
}

export default AdminCampaigns;
