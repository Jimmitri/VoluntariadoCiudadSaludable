import VolunteerLayout from "../components/VolunteerLayout";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";


function VolunteerDashboard() {
    const [latestCampaigns, setLatestCampaigns] = useState([]);

        useEffect(() => {
        const loadCampaigns = async () => {
            const q = query(
            collection(db, "campaigns"),
            where("status", "==", "activa"),
            limit(3)
            );

            const snapshot = await getDocs(q);

            const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            }));

            setLatestCampaigns(data);
        };

        loadCampaigns();
    }, []);
    
    return (
        <VolunteerLayout>
        <section className="dashboard-welcome">
            <h1>¡Bienvenido! 👋</h1>
            <p>Desde aquí podrás gestionar tus postulaciones y participar en campañas ambientales.</p>
        </section>

        <section className="dashboard-summary">
            <div className="summary-card green">
                <span className="summary-icon">🌿</span>

                <div className="summary-info">
                    <h3>0</h3>
                    <p>Campañas disponibles</p>
                    <Link
                    to="/volunteer/campaigns"
                    className="summary-link green-link"
                    >
                        Ver campañas →
                    </Link>
                </div>
            </div>

            <div className="summary-card yellow">
                <span className="summary-icon"> 📋</span>

                <div className="summary-info">
                    <h3>0</h3>
                    <p>Postulaciones activas</p>
                    <Link
                    to="/my-applications"
                    className="summary-link yellow-link"
                    >
                        Ver mis postulaciones →
                    </Link>
                </div>
            </div>

            <div className="summary-card blue">
                <span className="summary-icon">🕒</span>

                <div className="summary-info">
                    <h3>0</h3>
                    <p>Participaciones completadas</p>
                    <Link
                    to="/history"
                    className="summary-link blue-link"
                    >
                        Ver historial →
                    </Link>
                </div>
            </div>
        </section>

        <section className="dashboard-panel">
            <div className="panel-header">
            <h2>Última campaña a la que postulaste</h2>
            </div>

            <p className="empty-message">
            Aún no tienes postulaciones registradas.
            </p>
        </section>

        <section className="dashboard-panel">
            <div className="panel-header">
                <h2>Campañas disponibles</h2>
                <Link to="/volunteer/campaigns">Ver todas →</Link>
            </div>

            {latestCampaigns.length === 0 ? (
                <p className="empty-message">
                Aún no hay campañas disponibles.
                </p>
            ) : (
                <div className="volunteer-campaign-preview-grid">
                {latestCampaigns.map((campaign) => (
                    <div className="volunteer-campaign-preview-card" key={campaign.id}>
                    <img
                        src={campaign.imagen || "https://via.placeholder.com/300x160?text=Campaña"}
                        alt={campaign.nombre}
                    />

                    <div>
                        <h3>{campaign.nombre}</h3>
                        <p>📍 {campaign.ubicacion || "Ubicación no especificada"}</p>
                        <p>📅 {campaign.fecha || "Sin fecha"}</p>

                        <Link to="/volunteer/campaigns" className="preview-detail-link">
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