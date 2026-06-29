import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/config";
import AdminLayout from "../components/AdminLayout";

function AdminDashboard() {
    const [stats, setStats] = useState({
        campaigns: 0,
        pendingApplications: 0,
        volunteers: 0,
        activeCampaigns: 0,
    });

    const [recentCampaigns, setRecentCampaigns] = useState([]);
    const [recentApplications, setRecentApplications] = useState([]);

    useEffect(() => {
        const loadDashboardData = async () => {
        try {
            const campaignsSnap = await getDocs(collection(db, "campaigns"));
            const applicationsSnap = await getDocs(collection(db, "applications"));
            const usersSnap = await getDocs(collection(db, "users"));

            const campaigns = campaignsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            }));

            const applications = applicationsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            }));

            const users = usersSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            }));

            setStats({
            campaigns: campaigns.length,
            pendingApplications: applications.filter((app) => app.estado === "pendiente").length,
            volunteers: users.filter((user) => user.rol === "voluntario").length,
            activeCampaigns: campaigns.filter((camp) => camp.estado === "activa").length,
            });

            setRecentCampaigns(campaigns.slice(0, 3));
            setRecentApplications(applications.slice(0, 5));
        } catch (error) {
            console.error("Error cargando datos del admin:", error);
        }
        };

        loadDashboardData();
    }, []);

    return (
        <AdminLayout>
        <section className="admin-welcome">
            <div>
            <h1>¡Bienvenido Administrador! 👋</h1>
            <p>Desde aquí puedes gestionar campañas, postulaciones y voluntarios.</p>
            </div>
        </section>

        <section className="admin-summary">
            <Link to="/admin/campaigns" className="admin-summary-card green">
            <span className="admin-summary-icon">🌿</span>
            <div>
                <h3>{stats.campaigns}</h3>
                <p>Campañas registradas</p>
                <small>Ver campañas →</small>
            </div>
            </Link>

            <Link to="/admin/applications" className="admin-summary-card yellow">
            <span className="admin-summary-icon">📋</span>
            <div>
                <h3>{stats.pendingApplications}</h3>
                <p>Postulaciones pendientes</p>
                <small>Ver postulaciones →</small>
            </div>
            </Link>

            <Link to="/admin/participants" className="admin-summary-card blue">
            <span className="admin-summary-icon">👥</span>
            <div>
                <h3>{stats.volunteers}</h3>
                <p>Voluntarios registrados</p>
                <small>Ver voluntarios →</small>
            </div>
            </Link>

            <Link to="/admin/campaigns" className="admin-summary-card purple">
            <span className="admin-summary-icon">✅</span>
            <div>
                <h3>{stats.activeCampaigns}</h3>
                <p>Campañas activas</p>
                <small>Ver activas →</small>
            </div>
            </Link>
        </section>

        <section className="admin-dashboard-grid">
            <div className="admin-panel">
            <div className="admin-panel-header">
                <h2>Últimas postulaciones</h2>
                <Link to="/admin/applications">Ver todas →</Link>
            </div>

            {recentApplications.length === 0 ? (
                <p className="empty-message">Aún no hay postulaciones registradas.</p>
            ) : (
                <div className="admin-list">
                {recentApplications.map((app) => (
                    <div className="admin-list-item" key={app.id}>
                    <div>
                        <strong>{app.userName || app.userEmail || "Voluntario"}</strong>
                        <p>{app.campaignTitle || "Campaña"}</p>
                    </div>

                    <span className="status-badge">
                        {app.estado || "pendiente"}
                    </span>
                    </div>
                ))}
                </div>
            )}
            </div>

            <div className="admin-panel">
            <div className="admin-panel-header">
                <h2>Campañas recientes</h2>
                <Link to="/admin/campaigns">Ver todas →</Link>
            </div>

            {recentCampaigns.length === 0 ? (
                <p className="empty-message">
                    Aún no hay campañas registradas.
                </p>
                ) : (
                <div className="admin-campaign-list">
                    {recentCampaigns.map((campaign) => (
                    <div className="admin-campaign-item" key={campaign.id}>
                        <img
                        src={
                            campaign.imagen ||
                            "https://via.placeholder.com/120x80?text=Campaña"
                        }
                        alt={campaign.nombre}
                        />

                        <div className="admin-campaign-info">
                        <strong>{campaign.nombre}</strong>

                        <p className="admin-campaign-date">
                            📅 {campaign.fecha || "Sin fecha"}
                        </p>

                        <span className="admin-campaign-status">
                            {campaign.status || "Activa"}
                        </span>

                        <p className="admin-campaign-description">
                            {campaign.descripcion
                            ? campaign.descripcion.length > 95
                                ? campaign.descripcion.substring(0, 95) + "..."
                                : campaign.descripcion
                            : "Sin descripción"}
                        </p>

                        <p className="admin-campaign-location">
                            📍 {campaign.ubicacion || "Ubicación no especificada"}
                        </p>
                        </div>
                    </div>
                    ))}
                </div>
            )}
            </div>
        </section>
        </AdminLayout>
    );
}

export default AdminDashboard;