import VolunteerLayout from "../components/VolunteerLayout";
import { Link } from "react-router-dom";

function VolunteerDashboard() {
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
            </div>

            <p className="empty-message">
            Aún no hay campañas disponibles.
            </p>
        </section>
        </VolunteerLayout>
    );
    }

export default VolunteerDashboard;