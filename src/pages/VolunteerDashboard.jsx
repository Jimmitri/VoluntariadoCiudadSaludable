import VolunteerLayout from "../components/VolunteerLayout";
import { collection, query, where, limit, onSnapshot, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function VolunteerDashboard() {
    const [latestCampaigns, setLatestCampaigns] = useState([]);
    const [lastApplication, setLastApplication] = useState(null);

    const [stats, setStats] = useState({
        campaigns: 0,
        applications: 0,
        completed: 0,
    });

    useEffect(() => {
        const campaignsQuery = query(
        collection(db, "campaigns"),
        where("status", "==", "activa")
        );

        const latestCampaignsQuery = query(
        collection(db, "campaigns"),
        where("status", "==", "activa"),
        limit(3)
        );

        const unsubscribeCampaigns = onSnapshot(campaignsQuery, (snapshot) => {
        setStats((prev) => ({
            ...prev,
            campaigns: snapshot.size,
        }));
        });

        const unsubscribeLatestCampaigns = onSnapshot(latestCampaignsQuery, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        setLatestCampaigns(data);
        });

        const user = auth.currentUser;

        if (!user) {
        return () => {
            unsubscribeCampaigns();
            unsubscribeLatestCampaigns();
        };
        }

        const lastApplicationQuery = query(
            collection(db, "applications"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(1)
            );

            const unsubscribeLastApplication = onSnapshot(lastApplicationQuery, (snapshot) => {
            if (snapshot.empty) {
                setLastApplication(null);
                return;
            }

            setLastApplication({
                id: snapshot.docs[0].id,
                ...snapshot.docs[0].data(),
            });
        });

        const applicationsQuery = query(
        collection(db, "applications"),
        where("userId", "==", user.uid)
        );

        const unsubscribeApplications = onSnapshot(applicationsQuery, (snapshot) => {
        const applications = snapshot.docs.map((doc) => doc.data());

        const activeApplications = applications.filter(
            (app) => app.estado === "pendiente" || app.estado === "aceptada"
        ).length;

        const completedApplications = applications.filter(
            (app) => app.estado === "completada"
        ).length;

        setStats((prev) => ({
            ...prev,
            applications: activeApplications,
            completed: completedApplications,
        }));
        });

        return () => {
        unsubscribeCampaigns();
        unsubscribeLatestCampaigns();
        unsubscribeApplications();
        unsubscribeLastApplication();
        };
    }, []);

    return (
        <VolunteerLayout>
        <section className="dashboard-welcome">
            <h1>¡Bienvenido! 👋</h1>
            <p>
            Desde aquí podrás gestionar tus postulaciones y participar en campañas
            ambientales.
            </p>
        </section>

        <section className="dashboard-summary">
            <div className="summary-card green">
            <span className="summary-icon">🌿</span>

            <div className="summary-info">
                <h3>{stats.campaigns}</h3>
                <p>Campañas disponibles</p>
                <Link to="/volunteer/campaigns" className="summary-link green-link">
                Ver campañas →
                </Link>
            </div>
            </div>

            <div className="summary-card yellow">
            <span className="summary-icon">📋</span>

            <div className="summary-info">
                <h3>{stats.applications}</h3>
                <p>Postulaciones activas</p>
                <Link to="/my-applications" className="summary-link yellow-link">
                Ver mis postulaciones →
                </Link>
            </div>
            </div>

            <div className="summary-card blue">
            <span className="summary-icon">🕒</span>

            <div className="summary-info">
                <h3>{stats.completed}</h3>
                <p>Participaciones completadas</p>
                <Link to="/history" className="summary-link blue-link">
                Ver historial →
                </Link>
            </div>
            </div>
        </section>

        <section className="dashboard-panel">
            <div className="panel-header">
                <h2>Última campaña a la que postulaste</h2>
                <Link to="/my-applications">Ver todas →</Link>
            </div>

            {!lastApplication ? (
                <p className="empty-message">Aún no tienes postulaciones registradas.</p>
            ) : (
                <div className="last-application-card">
                <div>
                    <h3>{lastApplication.campaignName || "Campaña"}</h3>

                    <p>
                    Estado:{" "}
                    <span className={`application-status ${lastApplication.estado}`}>
                        {lastApplication.estado || "pendiente"}
                    </span>
                    </p>

                    <p>
                    Fecha de postulación:{" "}
                    {lastApplication.createdAt?.toDate
                        ? lastApplication.createdAt.toDate().toLocaleDateString("es-PE")
                        : "Fecha no disponible"}
                    </p>
                </div>

                <Link to="/my-applications" className="preview-detail-link">
                    Ver mis postulaciones →
                </Link>
                </div>
            )}
        </section>

        <section className="dashboard-panel">
            <div className="panel-header">
            <h2>Campañas disponibles</h2>
            <Link to="/volunteer/campaigns">Ver todas →</Link>
            </div>

            {latestCampaigns.length === 0 ? (
            <p className="empty-message">Aún no hay campañas disponibles.</p>
            ) : (
            <div className="volunteer-campaign-preview-grid">
                {latestCampaigns.map((campaign) => (
                <div className="volunteer-campaign-preview-card" key={campaign.id}>
                    <img
                    src={
                        campaign.imagen ||
                        "https://via.placeholder.com/300x160?text=Campaña"
                    }
                    alt={campaign.nombre}
                    />

                    <div>
                    <h3>{campaign.nombre}</h3>
                    <p>📍 {campaign.ubicacion || "Ubicación no especificada"}</p>
                    <p>📅 {campaign.fecha || "Sin fecha"}</p>

                    <Link
                        to="/volunteer/campaigns"
                        className="preview-detail-link"
                    >
                        Ver detalle →
                    </Link>
                    </div>
                </div>
                ))}
            </div>
            )}
        </section>
        </VolunteerLayout>
    );
}

export default VolunteerDashboard;