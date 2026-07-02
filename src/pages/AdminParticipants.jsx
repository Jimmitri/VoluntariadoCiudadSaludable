import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, } from "firebase/firestore";
import { db } from "../firebase/config";
import AdminLayout from "../components/AdminLayout";

function AdminParticipants() {
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [message, setMessage] = useState("");
    const [expandedParticipant, setExpandedParticipant] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "campaigns"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...docItem.data(),
            }));

            setCampaigns(data);
        });

        return () => unsubscribe();
        }, []);

        useEffect(() => {
        if (!selectedCampaign) return;

        const q = query(
            collection(db, "applications"),
            where("campaignId", "==", selectedCampaign.id)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs
            .map((docItem) => ({
                id: docItem.id,
                ...docItem.data(),
            }))
            .filter((p) =>
                ["aceptada", "completada", "no_asistio"].includes(p.estado)
            );

            setParticipants(data);
        });

        return () => unsubscribe();
    }, [selectedCampaign]);

    const leaders = participants.filter(
        (p) => (p.participationRole || "").toLowerCase().trim() === "lider"
    );
    const updateParticipant = async (id, data) => {
        try {
        await updateDoc(doc(db, "applications", id), {
            ...data,
            assignedAt: serverTimestamp(),
        });

        setMessage("Participante actualizado correctamente.");
        setTimeout(() => setMessage(""), 2000);
        } catch (error) {
        console.error(error);
        setMessage("No se pudo actualizar el participante.");
        }
    };

    const markAttendance = async (participant, attendance) => {
        const data =
        attendance === "asistio"
            ? {
                estado: "completada",
                attendance: "asistio",
                completedAt: serverTimestamp(),
            }
            : {
                estado: "no_asistio",
                attendance: "no_asistio",
                attendanceAt: serverTimestamp(),
            };

        await updateParticipant(participant.id, data);
    };

    return (
        <AdminLayout>
        <section className="admin-welcome">
            <h1>Participantes</h1>
            <p>
            Selecciona una campaña para visualizar participantes, asignar líderes,
            funciones y registrar asistencia.
            </p>
        </section>

        {!selectedCampaign ? (
            <section className="participants-campaigns-panel">
            <h2>Campañas registradas</h2>

            {campaigns.length === 0 ? (
                <p className="empty-message">No hay campañas registradas.</p>
            ) : (
                <div className="participants-campaigns-grid">
                {campaigns.map((campaign) => (
                    <article className="participant-campaign-card" key={campaign.id}>
                    <img
                        src={
                        campaign.imagen ||
                        "https://via.placeholder.com/300x160?text=Campaña"
                        }
                        alt={campaign.nombre}
                        loading="lazy"
                    />

                    <div>
                        <span className="campaign-status-badge">
                        {campaign.status || "activa"}
                        </span>

                        <h3>{campaign.nombre}</h3>
                        <p>📍 {campaign.ubicacion || "Sin ubicación"}</p>
                        <p>📅 {campaign.fecha || "Sin fecha"}</p>

                        <button
                        className="campaign-detail-btn"
                        onClick={() => setSelectedCampaign(campaign)}
                        >
                        Gestionar participantes →
                        </button>
                    </div>
                    </article>
                ))}
                </div>
            )}
            </section>
        ) : (
            <section className="participants-panel">
            <div className="participants-panel-header">
                <div>
                <button
                    className="back-modal-btn"
                    onClick={() => setSelectedCampaign(null)}
                >
                    ← Volver a campañas
                </button>

                <h2>{selectedCampaign.nombre}</h2>
                <p>
                    Participantes aceptados: <strong>{participants.length}</strong>
                </p>
                </div>
            </div>

            {message && <p className="admin-action-message">{message}</p>}

            {participants.length === 0 ? (
                <p className="empty-message">
                Esta campaña aún no tiene participantes aceptados.
                </p>
            ) : (
                <div className="participants-table">
                {participants.map((participant) => (
                    <article className="participant-row" key={participant.id}>
                        <div
                            className="participant-info participant-toggle"
                            onClick={() =>
                            setExpandedParticipant(
                                expandedParticipant === participant.id ? null : participant.id
                            )
                            }
                        >
                            <h3>{participant.userName || "Voluntario"}</h3>
                            <p>{participant.userEmail || "Sin correo"}</p>
                            <p>{participant.userPhone || "Sin teléfono"}</p>

                        </div>

                        <div className="participant-mobile-attendance">
                            {participant.estado === "aceptada" ? (
                            <div className="participant-attendance">
                                <button
                                className="approve-btn"
                                onClick={() => markAttendance(participant, "asistio")}
                                >
                                Asistió
                                </button>

                                <button
                                className="reject-btn"
                                onClick={() => markAttendance(participant, "no_asistio")}
                                >
                                No asistió
                                </button>
                            </div>
                            ) : (
                            <div className="participant-status-container">
                                <span className={`application-status ${participant.estado}`}>
                                {participant.estado === "completada" ? "Completada" : "No asistió"}
                                </span>
                            </div>
                            )}
                        </div>

                        <div
                            className={`participant-extra-fields ${
                            expandedParticipant === participant.id ? "open" : ""
                            }`}
                        >
                            <div className="participant-controls">
                            <label>Rol</label>
                            <select
                                value={participant.participationRole || "integrante"}
                                onChange={(e) => {
                                    const newRole = e.target.value;

                                    updateParticipant(participant.id, {
                                        participationRole: newRole,
                                        leaderId: newRole === "lider" ? "" : participant.leaderId || "",
                                        leaderName: newRole === "lider" ? "" : participant.leaderName || "",
                                    });
                                }}
                            >
                                <option value="integrante">Integrante</option>
                                <option value="lider">Líder</option>
                            </select>
                            </div>

                            <div className="participant-controls">
                            <label>Grupo</label>
                            <input
                                type="text"
                                placeholder="Ej. Equipo limpieza"
                                defaultValue={participant.groupName || ""}
                                onBlur={(e) =>
                                updateParticipant(participant.id, {
                                    groupName: e.target.value,
                                })
                                }
                            />
                            </div>

                            {(participant.participationRole || "").toLowerCase().trim() !== "lider" && (
                            <div className="participant-controls">
                                <label>Líder asignado</label>
                                <select
                                value={participant.leaderId || ""}
                                onChange={(e) => {
                                    const leader = leaders.find(
                                    (l) => l.userId === e.target.value
                                    );

                                    updateParticipant(participant.id, {
                                    leaderId: leader?.userId || "",
                                    leaderName: leader?.userName || "",
                                    groupName: leader?.groupName || participant.groupName || "",
                                    });
                                }}
                                >
                                <option value="">Sin líder</option>

                                {leaders.map((leader) => (
                                    <option key={leader.id} value={leader.userId}>
                                    {leader.userName || "Líder"}
                                    </option>
                                ))}
                                </select>
                            </div>
                            )}

                            <div className="participant-controls">
                            <label>Función</label>
                            <textarea
                                placeholder="Ej. Recolectar residuos"
                                defaultValue={participant.task || ""}
                                onBlur={(e) =>
                                updateParticipant(participant.id, {
                                    task: e.target.value,
                                })
                                }
                            />
                            </div>
                        </div>
                    </article>
                ))}
                </div>
            )}
            </section>
        )}
        </AdminLayout>
    );
}

export default AdminParticipants;