import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { db, storage } from "../firebase/config";
import AdminLayout from "../components/AdminLayout";

function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editFecha, setEditFecha] = useState("");
  const [editUbicacion, setEditUbicacion] = useState("");
  const [editVacantes, setEditVacantes] = useState("");
  const [editRequisitos, setEditRequisitos] = useState("");
  const [editStatus, setEditStatus] = useState("activa");
  const [editImagen, setEditImagen] = useState(null);
  const [editPreview, setEditPreview] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const q = query(
          collection(db, "campaigns"),
          where("status", "==", "activa")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));

        setCampaigns(data);
      } catch (err) {
        console.error("Error cargando campañas:", err);
        setError("No se pudieron cargar las campañas.");
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
      return date.toDate().toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }

    if (typeof date === "string") return date;

    return "Fecha no disponible";
  };

  const openEditModal = (campaign) => {
    setSelectedCampaign(campaign);

    setEditNombre(campaign.nombre || "");
    setEditDescripcion(campaign.descripcion || "");
    setEditFecha(campaign.fecha || "");
    setEditUbicacion(campaign.ubicacion || "");
    setEditVacantes(campaign.vacantes || "");
    setEditRequisitos(campaign.requisitos || "");
    setEditStatus(campaign.status || "activa");
    setEditImagen(null);
    setEditPreview(campaign.imagen || "");
    setEditMessage("");
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedCampaign(null);
    setEditImagen(null);
    setEditPreview("");
    setEditMessage("");
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setEditImagen(file);
      setEditPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateCampaign = async (e) => {
    e.preventDefault();

    if (!selectedCampaign) return;

    setEditLoading(true);
    setEditMessage("");

    try {
      let finalImageUrl = selectedCampaign.imagen || "";

      if (editImagen) {
        const imageRef = ref(
          storage,
          `campaigns/${Date.now()}-${editImagen.name}`
        );

        await uploadBytes(imageRef, editImagen);
        finalImageUrl = await getDownloadURL(imageRef);
      }

      await updateDoc(doc(db, "campaigns", selectedCampaign.id), {
        nombre: editNombre,
        descripcion: editDescripcion,
        fecha: editFecha,
        ubicacion: editUbicacion,
        vacantes: Number(editVacantes),
        requisitos: editRequisitos,
        status: editStatus,
        imagen: finalImageUrl,
        updatedAt: serverTimestamp(),
      });

      setCampaigns((prev) =>
        prev.map((camp) =>
          camp.id === selectedCampaign.id
            ? {
                ...camp,
                nombre: editNombre,
                descripcion: editDescripcion,
                fecha: editFecha,
                ubicacion: editUbicacion,
                vacantes: Number(editVacantes),
                requisitos: editRequisitos,
                status: editStatus,
                imagen: finalImageUrl,
              }
            : camp
        )
      );

      setEditMessage("Campaña actualizada correctamente.");

      setTimeout(() => {
        closeEditModal();
      }, 1200);
    } catch (error) {
      console.error("Error actualizando campaña:", error);
      setEditMessage("No se pudo actualizar la campaña.");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <AdminLayout>
      <main className="campaigns-page admin-campaigns-wrapper">
        <section className="campaigns-header">
          <span className="hero-badge">🌿 Administración</span>
          <h1>
            Gestión de <span>campañas</span>
          </h1>
          <p>
            Visualiza y modifica las campañas ambientales registradas en el
            sistema.
          </p>
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
              <button
                className="search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
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
                {searchTerm
                  ? `No se encontraron campañas para "${searchTerm}".`
                  : "No hay campañas activas en este momento."}
              </p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <>
              <p className="campaigns-count">
                {filtered.length} campaña{filtered.length !== 1 ? "s" : ""}{" "}
                encontrada{filtered.length !== 1 ? "s" : ""}
              </p>

              <div className="campaigns-grid">
                {filtered.map((camp) => (
                  <article key={camp.id} className="campaign-card">
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
                      <span className="campaign-status-badge">
                        ✅ {camp.status || "activa"}
                      </span>

                      <h2 className="campaign-card-title">{camp.nombre}</h2>

                      <div className="campaign-card-meta">
                        <div className="meta-item">
                          <span className="meta-icon">📅</span>
                          <span>{formatDate(camp.fecha)}</span>
                        </div>

                        <div className="meta-item">
                          <span className="meta-icon">📍</span>
                          <span>
                            {camp.ubicacion || "Ubicación no especificada"}
                          </span>
                        </div>

                        <div className="meta-item">
                          <span className="meta-icon">👥</span>
                          <span>
                            {camp.vacantes ?? "—"} vacantes disponibles
                          </span>
                        </div>
                      </div>

                      {camp.descripcion && (
                        <p className="campaign-card-desc">
                          {camp.descripcion.length > 120
                            ? camp.descripcion.slice(0, 120) + "…"
                            : camp.descripcion}
                        </p>
                      )}
                    </div>

                    <div className="campaign-card-footer">
                      <button
                        className="campaign-detail-btn"
                        onClick={() => openEditModal(camp)}
                      >
                        Editar campaña →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        {editModalOpen && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div
              className="edit-campaign-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={closeEditModal}>
                ✕
              </button>

              <div className="edit-campaign-layout">
                <div className="edit-campaign-image-panel">
                  <h3>Imagen de campaña</h3>
                  <p>Vista previa de la imagen actual o nueva.</p>

                  <div className="edit-campaign-preview">
                    {editPreview ? (
                      <img src={editPreview} alt="Vista previa" />
                    ) : (
                      <div className="campaign-preview-placeholder">
                        <span>🌿</span>
                        <p>Sin imagen</p>
                      </div>
                    )}
                  </div>

                  <label className="campaign-upload-btn">
                    Cambiar imagen
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                    />
                  </label>
                </div>

                <form
                  className="edit-campaign-form"
                  onSubmit={handleUpdateCampaign}
                >
                  <h2>Editar campaña</h2>

                  <div className="form-group">
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Fecha</label>
                    <input
                      type="text"
                      value={editFecha}
                      onChange={(e) => setEditFecha(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Ubicación</label>
                    <input
                      type="text"
                      value={editUbicacion}
                      onChange={(e) => setEditUbicacion(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Vacantes</label>
                    <input
                      type="number"
                      min="0"
                      value={editVacantes}
                      onChange={(e) => setEditVacantes(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Estado</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      required
                    >
                      <option value="activa">Activa</option>
                      <option value="inactiva">Inactiva</option>
                    </select>
                  </div>

                  <div className="form-group full">
                    <label>Descripción</label>
                    <textarea
                      value={editDescripcion}
                      onChange={(e) => setEditDescripcion(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group full">
                    <label>Requisitos</label>
                    <textarea
                      value={editRequisitos}
                      onChange={(e) => setEditRequisitos(e.target.value)}
                      required
                    />
                  </div>

                  {editMessage && (
                    <p className="register-message">{editMessage}</p>
                  )}

                  <button
                    type="submit"
                    className="register-btn"
                    disabled={editLoading}
                  >
                    {editLoading ? "Guardando cambios..." : "Guardar cambios"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
}

export default AdminCampaigns;
