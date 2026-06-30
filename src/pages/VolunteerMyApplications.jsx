import { useEffect, useMemo, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import VolunteerLayout from "../components/VolunteerLayout";

function VolunteerMyApplications() {
    const [applications, setApplications] = useState([]);
    const [filter, setFilter] = useState("todas");
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [groupParticipants, setGroupParticipants] = useState([]);

    useEffect(() => {
        const user = auth.currentUser;

        if (!user) {
        setLoading(false);
        return;
        }

        const q = query(
        collection(db, "applications"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        setApplications(data);
        setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!selectedApplication) {
            setGroupParticipants([]);
            return;
        }

        if (!selectedApplication.campaignId || !selectedApplication.groupName) {
            setGroupParticipants([]);
            return;
        }

        const q = query(
            collection(db, "applications"),
            where("campaignId", "==", selectedApplication.campaignId),
            where("groupName", "==", selectedApplication.groupName)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                }));

                const ordered = [...data].sort((a, b) => {
                    const roleA = (a.participationRole || "").toLowerCase().trim();
                    const roleB = (b.participationRole || "").toLowerCase().trim();

                    if (roleA === "lider" && roleB !== "lider") return -1;
                    if (roleA !== "lider" && roleB === "lider") return 1;

                    return (a.userName || "").localeCompare(b.userName || "");
                });

            setGroupParticipants(ordered);
        });

        return () => unsubscribe();
    }, [selectedApplication]);

    const filteredApplications = useMemo(() => {
        if (filter === "todas") return applications;
        return applications.filter((app) => app.estado === filter);
    }, [applications, filter]);

    const formatDate = (date) => {
        if (!date) return "Fecha no disponible";
        if (date.toDate) return date.toDate().toLocaleDateString("es-PE");
        return "Fecha no disponible";
    };

    return (
        <VolunteerLayout>
        <section className="dashboard-welcome">
            <h1>Mis postulaciones</h1>
            <p>
            Revisa el estado de tus postulaciones y el historial de campañas en las
            que participaste.
            </p>
        </section>

        <section className="applications-page-panel">
            <div className="applications-filters">
            {["todas", "pendiente", "aceptada", "rechazada", "completada"].map(
                (item) => (
                <button
                    key={item}
                    className={filter === item ? "active" : ""}
                    onClick={() => setFilter(item)}
                >
                    {item}
                </button>
                )
            )}
            </div>

            {loading ? (
            <p className="empty-message">Cargando postulaciones...</p>
            ) : filteredApplications.length === 0 ? (
            <p className="empty-message">
                No hay postulaciones para este filtro.
            </p>
            ) : (
            <div className="applications-list">
                {filteredApplications.map((app) => (
                <article
                    className="application-card clickable-application-card"
                    key={app.id}
                    onClick={() => setSelectedApplication(app)}
                >
                    <div className="application-main-info">
                        <h3>{app.campaignName}</h3>

                        <p><strong>Fecha de postulación:</strong> {formatDate(app.createdAt)}</p>

                        <p><strong>Disponibilidad:</strong> {app.availability}</p>

                        {app.motivation && (
                            <p><strong>Motivación:</strong> {app.motivation}</p>
                        )}
                    </div>
                    <div className="application-right">
                        <span className={`application-status ${app.estado}`}>
                            {app.estado}
                        </span>

                        {app.estado === "rechazada" && app.rejectionReason && (
                            <div className="rejection-box">
                                <strong>Motivo del rechazo</strong>

                                <p>{app.rejectionReason}</p>
                            </div>
                        )}
                    </div>
                </article>
                ))}
            </div>
            )}
        </section>
        {selectedApplication && (
            <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
                <div
                className="volunteer-application-modal"
                onClick={(e) => e.stopPropagation()}
                >
                <button
                    className="modal-close"
                    onClick={() => setSelectedApplication(null)}
                >
                    ✕
                </button>

                <h2>{selectedApplication.campaignName || "Campaña"}</h2>

                {selectedApplication.campaignImage && (
                    <img
                        src={selectedApplication.campaignImage}
                        alt={selectedApplication.campaignName}
                        className="application-modal-image"
                    />
                    )}

                    <div className="application-campaign-info">
                    <p>📅 {selectedApplication.campaignDate || "Fecha no registrada"}</p>
                    <p>📍 {selectedApplication.campaignLocation || "Ubicación no registrada"}</p>
                    </div>

                    {selectedApplication.campaignDescription && (
                    <div className="application-description-box">
                        <h3>Sobre la campaña</h3>
                        <p>{selectedApplication.campaignDescription}</p>
                    </div>
                )}

                <span className={`application-status ${selectedApplication.estado}`}>
                    {selectedApplication.estado || "pendiente"}
                </span>

                <div className="participation-detail-grid">
                    <div>
                    <h3>Mi participación</h3>

                    <p>
                        <strong>Rol:</strong>{" "}
                        {selectedApplication.participationRole || "Aún no asignado"}
                    </p>

                    <p>
                        <strong>Grupo:</strong>{" "}
                        {selectedApplication.groupName || "Aún no asignado"}
                    </p>

                    {selectedApplication.participationRole !== "lider" && (
                        <p>
                        <strong>Líder:</strong>{" "}
                        {selectedApplication.leaderName || "Aún no asignado"}
                        </p>
                    )}

                    <p>
                        <strong>Función:</strong>{" "}
                        {selectedApplication.task || "Aún no asignada"}
                    </p>

                    {selectedApplication.attendance && (
                        <p>
                        <strong>Asistencia:</strong>{" "}
                        {selectedApplication.attendance === "asistio"
                            ? "Asistió"
                            : "No asistió"}
                        </p>
                    )}
                    </div>

                    <div>
                    <h3>Equipo asignado</h3>
                    {groupParticipants.length === 0 ? (
                        <p className="empty-small">
                        Aún no hay información del equipo asignado.
                        </p>
                    ) : (
                        <div className="team-list">
                        {groupParticipants.map((person) => (
                            <div className="team-member" key={person.id}>
                                <strong>
                                    {person.participationRole === "lider"}
                                    {person.userName || "Voluntario"}
                                    {person.userId === selectedApplication.userId && " (Tú)"}
                                </strong>

                                <p>
                                    {person.participationRole === "lider" ? "Líder" : "Integrante"}
                                </p>

                                {person.userPhone && (
                                    <p> {person.userPhone}</p>
                                )}

                            </div>
                        ))}
                        </div>
                    )}
                    </div>
                </div>
                </div>
            </div>
        )}
        </VolunteerLayout>
    );
}

export default VolunteerMyApplications;