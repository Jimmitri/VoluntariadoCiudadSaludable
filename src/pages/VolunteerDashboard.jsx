function VolunteerDashboard() {
    return (
        <main className="dashboard">
            <h1>Panel del Voluntario</h1>
            <p>Bienvenido. Desde aquí podrás gestionar tus postulaciones.</p>

            <div className="dashboard-grid">
                <div className="dashboard-card">Ver campañas</div>
                <div className="dashboard-card">Mis postulaciones</div>
                <div className="dashboard-card">Historial</div>
            </div>
        </main>
    );
}

export default VolunteerDashboard;