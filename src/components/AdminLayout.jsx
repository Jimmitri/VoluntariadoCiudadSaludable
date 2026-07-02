import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import logo from "../assets/images/logo.avif";
import user from "../assets/images/user.png";


function AdminLayout({ children }) {
    const navigate = useNavigate();
    const [adminData, setAdminData] = useState(null);
    const [openMenu, setOpenMenu] = useState(false);
    const [openSidebar, setOpenSidebar] = useState(false);

    useEffect(() => {
        const cache = localStorage.getItem("userData");

        if (cache) {
            setAdminData(JSON.parse(cache));
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                navigate("/login");
                return;
            }

            try {
                const userSnap = await getDoc(doc(db, "users", user.uid));

                if (userSnap.exists()) {
                    const data = userSnap.data();

                    setAdminData(data);

                    localStorage.setItem("userData", JSON.stringify(data));
                }
            } catch (error) {
                console.error("Error loading admin:", error);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        localStorage.removeItem("userData");
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
            <img
                src={logo}
                alt="Ciudad Saludable"
                loading="lazy"
                className="company-logo"
            />
            <div>
                <h2>Ciudad Saludable</h2>
                <p>Panel administrativo</p>
            </div>
            </Link>

            <div className="admin-user-menu">
            <button className="admin-user-button" onClick={() => setOpenMenu(!openMenu)}>
                {adminData?.fotoUrl ? (
                <img src={adminData.fotoUrl} 
                alt="Administrador"
                loading="lazy"
                className="user-photo" />
                ) : (
                <img src={user} 
                alt="Perfil" 
                loading="lazy"
                className="user-photo"></img>
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
            <Link to="/admin/contact-requests" onClick={() => setOpenSidebar(false)}>
                📩 Solicitudes
            </Link>

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