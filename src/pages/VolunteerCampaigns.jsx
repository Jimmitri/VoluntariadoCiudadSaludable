import { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import VolunteerLayout from "../components/VolunteerLayout";
import { onSnapshot, collection, query, where, getDocs, serverTimestamp, doc, getDoc, runTransaction, } from "firebase/firestore";


function VolunteerCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const [modalView, setModalView] = useState("detail");

  const [motivation, setMotivation] = useState("");
  const [availability, setAvailability] = useState("");
  const [experience, setExperience] = useState("");
  const [comment, setComment] = useState("");
  const [applyMessage, setApplyMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "campaigns"),
      where("status", "==", "activa")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCampaigns(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error cargando campañas:", err);
        setError("No se pudieron cargar las campañas. Intenta de nuevo más tarde.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
  const openCampaignModal = (campaign) => {
    setSelectedCampaign(campaign);
    setModalView("detail");
    setApplyMessage("");
    setMotivation("");
    setAvailability("");
    setExperience("");
    setComment("");
  };

  const closeCampaignModal = () => {
    setSelectedCampaign(null);
    setModalView("detail");
    setApplyMessage("");
  };

  const handleStartApply = () => {
    const user = auth.currentUser;

    if (!user) {
      navigate(`/login`);
      return;
    }

    setModalView("apply");
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    if (!motivation.trim() || !availability) {
      setApplyMessage("Completa la motivación y confirma tu disponibilidad.");
      return;
    }

    setSending(true);
    setApplyMessage("");

    try {
      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (!userSnap.exists()) {
        setApplyMessage("No se encontraron los datos del usuario.");
        setSending(false);
        return;
      }

      const userData = userSnap.data();

      const duplicateQuery = query(
        collection(db, "applications"),
        where("campaignId", "==", selectedCampaign.id),
        where("userId", "==", user.uid)
      );

      const duplicateSnap = await getDocs(duplicateQuery);

      if (!duplicateSnap.empty) {
        setApplyMessage("Ya postulaste a esta campaña.");
        setSending(false);
        return;
      }

      const campaignRef = doc(db, "campaigns", selectedCampaign.id);

      await runTransaction(db, async (transaction) => {
        const campaignSnap = await transaction.get(campaignRef);
      
        if (!campaignSnap.exists()) {
          throw new Error("La campaña no existe.");
        }

        const campaignData = campaignSnap.data();
        const currentVacantes = Number(campaignData.vacantes || 0);

        if (currentVacantes <= 0) {
          throw new Error("No hay vacantes disponibles.");
        }

        const applicationRef = doc(collection(db, "applications"));

        transaction.set(applicationRef, {
          campaignId: selectedCampaign.id,
          campaignName: selectedCampaign.nombre || "Campaña",

          userId: user.uid,
          userName: userData.nombre || "Voluntario",
          userEmail: userData.email || userData.correo || user.email,
          userPhone: userData.telefono || "",

          motivation,
          availability,
          previousExperience: experience,
          additionalComment: comment,

          estado: "pendiente",
          createdAt: serverTimestamp(),
        });

        transaction.update(campaignRef, {
          vacantes: currentVacantes - 1,
        });
      });

      setSelectedCampaign((prev) => ({
        ...prev,
        vacantes: Number(prev.vacantes || 0) - 1,
      }));

      setApplyMessage("Postulación enviada correctamente.");

      setMotivation("");
      setAvailability("");
      setExperience("");
      setComment("");

      setTimeout(() => {
        closeCampaignModal();
      }, 1500);
    } catch (error) {
      console.error("Error enviando postulación:", error);
      setApplyMessage(error.message || "No se pudo enviar la postulación.");
    } finally {
      setSending(false);
    }
  };
  return (
    <VolunteerLayout>
    <main className="campaigns-page volunteer-campaigns-wrapper">
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
                      onClick={() => openCampaignModal(camp)}
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
        <div className="modal-overlay" onClick={closeCampaignModal}>
          <div className="campaign-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeCampaignModal}>
              ✕
            </button>

            {modalView === "detail" && (
              <>
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
                    <p>👥 {selectedCampaign.vacantes ?? "—"} vacantes disponibles</p>
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

                  <button className="postular-link" onClick={handleStartApply}>
                    {auth.currentUser
                      ? "Postular ahora →"
                      : "Iniciar sesión para postular →"}
                  </button>
                </div>
              </>
            )}

            {modalView === "apply" && (
              <div className="modal-content">
                <button className="back-modal-btn" onClick={() => setModalView("detail")}>
                  ← Volver al detalle
                </button>

                <h2>Postulación a campaña</h2>

                <div className="apply-campaign-resume">
                  <strong>{selectedCampaign.nombre}</strong>
                  <p>📍 {selectedCampaign.ubicacion || "Ubicación no especificada"}</p>
                  <p>📅 {formatDate(selectedCampaign.fecha)}</p>
                </div>

                <form className="modal-apply-form" onSubmit={handleSubmitApplication}>
                  <label>Motivación</label>
                  <textarea
                    placeholder="¿Por qué deseas participar en esta campaña?"
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    required
                  />

                  <label>Disponibilidad</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="Confirmo que puedo asistir">Confirmo que puedo asistir</option>
                    <option value="Necesito confirmar mi disponibilidad">Necesito confirmar mi disponibilidad</option>
                  </select>

                  <label>Experiencia previa</label>
                  <textarea
                    placeholder="Opcional: comenta si participaste antes en actividades similares."
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />

                  <label>Comentario adicional</label>
                  <textarea
                    placeholder="Opcional: agrega algún comentario para la organización."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />

                  {applyMessage && <p className="apply-message">{applyMessage}</p>}

                  <button type="submit" className="apply-submit-btn" disabled={sending}>
                    {sending ? "Enviando..." : "Enviar postulación"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
    </VolunteerLayout>
  );
}

export default VolunteerCampaigns;
