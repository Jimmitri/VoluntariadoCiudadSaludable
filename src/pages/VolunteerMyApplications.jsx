import { useEffect, useMemo, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import VolunteerLayout from "../components/VolunteerLayout";

function VolunteerMyApplications() {
    const [applications, setApplications] = useState([]);
    const [filter, setFilter] = useState("todas");
    const [loading, setLoading] = useState(true);

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
                <article className="application-card" key={app.id}>
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
        </VolunteerLayout>
    );
}

export default VolunteerMyApplications;