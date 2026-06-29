import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

function AdminLayout({ children }) {
    const navigate = useNavigate();
    const [adminData, setAdminData] = useState(null);
    const [openMenu, setOpenMenu] = useState(false);
    const [openSidebar, setOpenSidebar] = useState(false);

    useEffect(() => {
        const loadAdmin = async () => {
        const user = auth.currentUser;

        if (!user) {
            navigate("/login");
            return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            setAdminData(userSnap.data());
        }
        };

        loadAdmin();
    }, [navigate]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div className="admin-layout">
        <header className="admin-header">
            <button className="admin-menu-toggle" onClick={() => setOpenSidebar(true)}>
            ☰
            </button>

            <Link to="/admin" className="admin-logo">
            <span className="logo-icon">🌱</span>
            <div>
                <h2>Ciudad Saludable</h2>
                <p>Panel administrativo</p>
            </div>
            </Link>

            <div className="admin-user-menu">
            <button className="admin-user-button" onClick={() => setOpenMenu(!openMenu)}>
                {adminData?.fotoUrl ? (
                <img src={adminData.fotoUrl} alt="Administrador" className="user-photo" />
                ) : (
                <div className="user-avatar">👤</div>
                )}

                <div>
                <strong>{adminData?.nombre || "Administrador"}</strong>
                <span>{adminData?.rol || "admin"}</span>
                </div>

                <span>⌄</span>
            </button>

            {openMenu && (
                <div className="dropdown-menu">
                <button onClick={handleLogout}>Cerrar sesión</button>
                </div>
            )}
            </div>
        </header>

        <div className="admin-body">
            <aside className={`admin-sidebar ${openSidebar ? "open" : ""}`}>
            <button className="close-sidebar" onClick={() => setOpenSidebar(false)}>
                ✕
            </button>

            <Link to="/admin" onClick={() => setOpenSidebar(false)}>🏠 Inicio</Link>
            <Link to="/admin/campaigns" onClick={() => setOpenSidebar(false)}>🌿 Campañas</Link>
            <Link to="/admin/create-campaign" onClick={() => setOpenSidebar(false)}>➕ Crear campaña</Link>
            <Link to="/admin/applications" onClick={() => setOpenSidebar(false)}>📋 Postulaciones</Link>
            <Link to="/admin/participants" onClick={() => setOpenSidebar(false)}>👥 Participantes</Link>

            <button onClick={handleLogout} className="admin-sidebar-logout">
                🚪 Cerrar sesión
            </button>
            </aside>

            {openSidebar && (
            <div className="sidebar-overlay" onClick={() => setOpenSidebar(false)}></div>
            )}

            <main className="admin-content">{children}</main>
        </div>
        </div>
    );
}

export default AdminLayout;