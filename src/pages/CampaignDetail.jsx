import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Carga el documento específico desde Firestore usando el ID de la URL ──
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const docRef = doc(db, "campaigns", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("La campaña no fue encontrada.");
        } else {
          setCampaign({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Error cargando detalle de campaña:", err);
        setError("No se pudo cargar la información. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  // ── Formatea fechas: soporta Timestamp, Date y string ──
  const formatDate = (date) => {
    if (!date) return "Fecha no disponible";
    if (date.toDate) {
      const d = date.toDate();
      return d.toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
    }
    if (typeof date === "string") return date;
    try {
      const d = new Date(date);
      if (!isNaN(d)) return d.toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
    } catch (_) {}
    return "Fecha no disponible";
  };

  // ── Estado: cargando ──
  if (loading) {
    return (
      <main className="campaign-detail-page">
        <div className="detail-feedback">
          <p className="loading-message">⏳ Cargando campaña...</p>
        </div>
        <DetailStyles />
      </main>
    );
  }

  // ── Estado: error ──
  if (error) {
    return (
      <main className="campaign-detail-page">
        <div className="detail-feedback">
          <p className="error-message">{error}</p>
          <button className="back-btn" onClick={() => navigate("/campaigns")}>
            ← Volver a campañas
          </button>
        </div>
        <DetailStyles />
      </main>
    );
  }

  return (
    <main className="campaign-detail-page">
      {/* ── Breadcrumb ── */}
      <nav className="detail-breadcrumb">
        <Link to="/campaigns">← Volver a campañas</Link>
      </nav>

      <article className="detail-card">
        {/* ── Encabezado de la card ── */}
        <header className="detail-header">
          <span className="campaign-status-badge">✅ Activa</span>
          <h1>{campaign.nombre}</h1>
        </header>

        {/* ── Información rápida ── */}
        <div className="detail-meta-grid">
          <div className="detail-meta-item">
            <span className="detail-meta-icon">📅</span>
            <div>
              <p className="meta-label">Fecha</p>
              <p className="meta-value">{formatDate(campaign.fecha)}</p>
            </div>
          </div>

          <div className="detail-meta-item">
            <span className="detail-meta-icon">📍</span>
            <div>
              <p className="meta-label">Ubicación</p>
              <p className="meta-value">
                {campaign.ubicacion || "No especificada"}
              </p>
            </div>
          </div>

          <div className="detail-meta-item">
            <span className="detail-meta-icon">👥</span>
            <div>
              <p className="meta-label">Vacantes disponibles</p>
              <p className="meta-value">
                {campaign.vacantes !== undefined
                  ? `${campaign.vacantes} vacante${campaign.vacantes !== 1 ? "s" : ""}`
                  : "No especificado"}
              </p>
            </div>
          </div>
        </div>

        <hr className="detail-divider" />

        {/* ── Descripción detallada ── */}
        <section className="detail-section">
          <h2>🌿 Sobre esta campaña</h2>
          <p>
            {campaign.descripcion || "No se ha proporcionado una descripción para esta campaña."}
          </p>
        </section>

        {/* ── Requisitos de participación ── */}
        <section className="detail-section">
          <h2>📋 Requisitos de participación</h2>
          {campaign.requisitos ? (
            Array.isArray(campaign.requisitos) ? (
              <ul className="requisitos-list">
                {campaign.requisitos.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            ) : (
              <p>{campaign.requisitos}</p>
            )
          ) : (
            <p className="detail-placeholder">
              No hay requisitos específicos para esta campaña. ¡Todos son bienvenidos!
            </p>
          )}
        </section>

        <hr className="detail-divider" />

        {/* ── Footer de acción ── */}
        <footer className="detail-actions">
          <div className="detail-vacantes-info">
            <span className="vacantes-badge">
              👥 {campaign.vacantes !== undefined ? campaign.vacantes : "—"} vacantes
            </span>
          </div>

          {/* Botón Postular – se conectará en el siguiente Sprint */}
          <Link to={`/apply/${id}`} className="postular-btn">
            🌱 Postular ahora
          </Link>
        </footer>
      </article>

      <DetailStyles />
    </main>
  );
}

// ── Estilos encapsulados como componente para reutilizarlos en los estados de carga/error ──
function DetailStyles() {
  return (
    <style>{`
      /* ── Page ── */
      .campaign-detail-page {
        min-height: calc(100vh - 72px);
        background: linear-gradient(180deg, #f2f7f2 0%, #ffffff 100%);
        padding: 40px 80px 60px;
      }

      /* ── Breadcrumb ── */
      .detail-breadcrumb {
        margin-bottom: 24px;
      }

      .detail-breadcrumb a {
        font-size: 14px;
        font-weight: 700;
        color: #2e7d32;
      }

      .detail-breadcrumb a:hover {
        opacity: 0.75;
      }

      /* ── Feedback states ── */
      .detail-feedback {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        padding: 20px 0;
      }

      .loading-message {
        color: #526058;
        background: #f4f8f4;
        padding: 18px 22px;
        border-radius: 12px;
        font-size: 15px;
      }

      .error-message {
        background: #ffe6e6;
        color: #b00020;
        padding: 14px 18px;
        border-radius: 12px;
        font-size: 14px;
      }

      .back-btn {
        background: transparent;
        border: 1.5px solid #2e7d32;
        color: #2e7d32;
        padding: 10px 20px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 800;
        cursor: pointer;
        transition: background 0.18s ease;
      }

      .back-btn:hover {
        background: #e8f5e9;
      }

      /* ── Card principal ── */
      .detail-card {
        max-width: 860px;
        background: white;
        border-radius: 22px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
        overflow: hidden;
        border: 1px solid #eef5ef;
      }

      /* ── Header de la card ── */
      .detail-header {
        padding: 36px 40px 24px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        background: linear-gradient(135deg, #f0faf1 0%, #ffffff 100%);
        border-bottom: 1px solid #eef5ef;
      }

      .campaign-status-badge {
        width: fit-content;
        background: #e8f5e9;
        color: #2e7d32;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 800;
      }

      .detail-header h1 {
        font-size: 34px;
        font-weight: 900;
        color: #073b20;
        line-height: 1.15;
        letter-spacing: -0.5px;
        margin: 0;
      }

      /* ── Meta grid (3 columnas) ── */
      .detail-meta-grid {
        padding: 28px 40px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        border-bottom: 1px solid #f0f5f0;
      }

      .detail-meta-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: #f8fbf8;
        padding: 16px 18px;
        border-radius: 14px;
      }

      .detail-meta-icon {
        font-size: 22px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .meta-label {
        font-size: 12px;
        font-weight: 800;
        color: #526058;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0 0 4px 0;
      }

      .meta-value {
        font-size: 15px;
        font-weight: 700;
        color: #102015;
        margin: 0;
        line-height: 1.3;
      }

      /* ── Divider ── */
      .detail-divider {
        border: none;
        border-top: 1px solid #eef5ef;
        margin: 0 40px;
      }

      /* ── Secciones de contenido ── */
      .detail-section {
        padding: 28px 40px;
      }

      .detail-section h2 {
        font-size: 18px;
        font-weight: 900;
        color: #073b20;
        margin-bottom: 14px;
      }

      .detail-section p {
        font-size: 15px;
        color: #26352b;
        line-height: 1.7;
        margin: 0;
      }

      .detail-placeholder {
        color: #6a756d !important;
        font-style: italic;
      }

      .requisitos-list {
        list-style: none;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 0;
      }

      .requisitos-list li {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 15px;
        color: #26352b;
        line-height: 1.5;
      }

      .requisitos-list li::before {
        content: "✔";
        color: #2e7d32;
        font-weight: 900;
        flex-shrink: 0;
        margin-top: 1px;
      }

      /* ── Footer de acciones ── */
      .detail-actions {
        padding: 24px 40px 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        background: #f8fbf8;
        border-top: 1px solid #eef5ef;
      }

      .vacantes-badge {
        background: #e8f5e9;
        color: #2e7d32;
        padding: 8px 16px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 800;
      }

      /* ── Botón Postular ── */
      .postular-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 14px 32px;
        background: #2e7d32;
        color: white;
        border-radius: 12px;
        font-size: 15px;
        font-weight: 800;
        transition: background 0.18s ease, transform 0.15s ease;
      }

      .postular-btn:hover {
        background: #256b29;
        transform: translateY(-2px);
      }

      /* ── Responsive ── */
      @media (max-width: 900px) {
        .campaign-detail-page {
          padding: 24px 18px 50px;
        }

        .detail-header {
          padding: 26px 22px 18px;
        }

        .detail-header h1 {
          font-size: 26px;
        }

        .detail-meta-grid {
          grid-template-columns: 1fr;
          padding: 20px 22px;
        }

        .detail-divider {
          margin: 0 22px;
        }

        .detail-section {
          padding: 20px 22px;
        }

        .detail-actions {
          padding: 20px 22px 26px;
          flex-direction: column;
          align-items: flex-start;
        }

        .postular-btn {
          width: 100%;
          justify-content: center;
        }
      }
    `}</style>
  );
}

export default CampaignDetail;
