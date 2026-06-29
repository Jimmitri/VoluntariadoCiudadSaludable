import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import AdminLayout from "../components/AdminLayout";

function AdminApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [customReason, setCustomReason] = useState("");

    useEffect(() => {
        const q = query(
        collection(db, "applications"),
        where("estado", "==", "pendiente")
        );

        const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            const data = snapshot.docs.map((document) => ({
            id: document.id,
            ...document.data(),
            }));

            setApplications(data);
            setLoading(false);
        },
        (error) => {
            console.error("Error cargando postulaciones:", error);
            setMessage("No se pudieron cargar las postulaciones.");
            setLoading(false);
        }
        );

        return () => unsubscribe();
    }, []);

    const updateApplicationStatus = async (applicationId, newStatus) => {
        try {
        await updateDoc(doc(db, "applications", applicationId), {
            estado: newStatus,
            reviewedAt: serverTimestamp(),
        });

        setMessage(
            newStatus === "aceptada"
            ? "Postulación aprobada correctamente."
            : "Postulación rechazada correctamente."
        );

        setTimeout(() => setMessage(""), 2500);
        } catch (error) {
        console.error("Error actualizando postulación:", error);
        setMessage("No se pudo actualizar la postulación.");
        }
    };

    const openRejectModal = (application) => {
        setSelectedApplication(application);
        setRejectReason("");
        setCustomReason("");
        setRejectModalOpen(true);
        };

        const closeRejectModal = () => {
        setRejectModalOpen(false);
        setSelectedApplication(null);
        setRejectReason("");
        setCustomReason("");
        };

        const confirmRejectApplication = async () => {
        if (!selectedApplication) return;

        if (!rejectReason) {
            setMessage("Selecciona un motivo de rechazo.");
            return;
        }

        if (rejectReason === "Otro motivo" && !customReason.trim()) {
            setMessage("Escribe el motivo del rechazo.");
            return;
        }

        const finalReason =
            rejectReason === "Otro motivo" ? customReason.trim() : rejectReason;

        await updateDoc(doc(db, "applications", selectedApplication.id), {
            estado: "rechazada",
            rejectionReason: finalReason,
            reviewedAt: serverTimestamp(),
        });

        setMessage("Postulación rechazada correctamente.");
        closeRejectModal();

        setTimeout(() => setMessage(""), 2500);
    };

    return (
        <AdminLayout>
        <section className="admin-welcome">
            <h1>Gestión de postulaciones</h1>
            <p>
            Revisa las postulaciones pendientes y aprueba o rechaza la participación
            de los voluntarios.
            </p>
        </section>

        <section className="admin-applications-panel">
            <div className="admin-panel-header">
            <h2>Postulaciones pendientes</h2>
            </div>

            {message && <p className="admin-action-message">{message}</p>}

            {loading ? (
            <p className="empty-message">Cargando postulaciones...</p>
            ) : applications.length === 0 ? (
            <p className="empty-message">No hay postulaciones pendientes.</p>
            ) : (
            <div className="admin-applications-list">
                {applications.map((app) => (
                <article className="admin-application-card" key={app.id}>
                    <div className="admin-application-info">
                    <h3>{app.campaignName || "Campaña"}</h3>

                    <p>
                        <strong>Voluntario:</strong>{" "}
                        {app.userName || "No especificado"}
                    </p>

                    <p>
                        <strong>Correo:</strong>{" "}
                        {app.userEmail || "No especificado"}
                    </p>

                    <p>
                        <strong>Teléfono:</strong>{" "}
                        {app.userPhone || "No especificado"}
                    </p>

                    <p>
                        <strong>Disponibilidad:</strong>{" "}
                        {app.availability || "No especificada"}
                    </p>

                    {app.motivation && (
                        <p>
                        <strong>Motivación:</strong> {app.motivation}
                        </p>
                    )}

                    {app.previousExperience && (
                        <p>
                        <strong>Experiencia previa:</strong>{" "}
                        {app.previousExperience}
                        </p>
                    )}

                    {app.additionalComment && (
                        <p>
                        <strong>Comentario adicional:</strong>{" "}
                        {app.additionalComment}
                        </p>
                    )}
                    </div>

                    <div className="admin-application-actions">
                    <span className="application-status pendiente">
                        pendiente
                    </span>

                    <button
                        className="approve-btn"
                        onClick={() =>
                        updateApplicationStatus(app.id, "aceptada")
                        }
                    >
                        Aprobar
                    </button>

                    <button
                        className="reject-btn"
                        onClick={() => openRejectModal(app)}
                    >
                        Rechazar
                    </button>
                    </div>
                </article>
                ))}
            </div>
            )}
        </section>
        {rejectModalOpen && (
            <div className="modal-overlay" onClick={closeRejectModal}>
                <div className="reject-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Rechazar postulación</h2>
                <p>Selecciona el motivo por el cual se rechazará esta postulación.</p>

                <div className="reject-options">
                    {[
                    "No cumple con los requisitos de la campaña",
                    "Vacantes cubiertas",
                    "Disponibilidad incompatible con la campaña",
                    "Otro motivo",
                    ].map((reason) => (
                    <label key={reason}>
                        <input
                        type="radio"
                        name="rejectReason"
                        value={reason}
                        checked={rejectReason === reason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        />
                        {reason}
                    </label>
                    ))}
                </div>

                {rejectReason === "Otro motivo" && (
                    <textarea
                    className="reject-textarea"
                    placeholder="Escribe un motivo breve..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    />
                )}

                <div className="reject-modal-actions">
                    <button className="cancel-btn" onClick={closeRejectModal}>
                    Cancelar
                    </button>

                    <button className="reject-btn" onClick={confirmRejectApplication}>
                    Rechazar
                    </button>
                </div>
                </div>
            </div>
        )}
        </AdminLayout>
    );
}

export default AdminApplications;