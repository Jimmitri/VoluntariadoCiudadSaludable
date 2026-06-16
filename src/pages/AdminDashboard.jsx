function AdminDashboard() {
    return (
        <main className="dashboard">
            <h1>Panel del Administrador</h1>
            <p>Bienvenido. Desde aquí podrás gestionar el sistema.</p>

            <div className="dashboard-grid">
                <div className="dashboard-card">Crear campañas</div>
                <div className="dashboard-card">Gestionar postulaciones</div>
                <div className="dashboard-card">Lista de participantes</div>
            </div>
        </main>
    );
    }

export default AdminDashboard;