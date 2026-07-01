import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

function VolunteerLayout({ children }) {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [openMenu, setOpenMenu] = useState(false);
    const [openSidebar, setOpenSidebar] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
        const user = auth.currentUser;

        if (!user) {
            navigate("/login");
            return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            setUserData(userSnap.data());
        }
        };

        loadUser();
    }, [navigate]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div className="volunteer-layout">
        <header className="volunteer-header">
            <button
                className="menu-toggle"
                onClick={() => setOpenSidebar(true)}
                >
                ☰
            </button>
            <Link to="/volunteer" className="volunteer-logo">
            <span className="logo-icon">🌱</span>
            <div>
                <h2>Ciudad Saludable</h2>
                <p>Juntos por un planeta mejor</p>
            </div>
            </Link>

            <div className="user-menu">
            <button className="user-button" onClick={() => setOpenMenu(!openMenu)}>
                {userData?.photoURL ? (
                <img src={userData.photoURL} alt="Perfil" className="user-photo" />
                ) : (
                <div className="user-avatar">👤</div>
                )}

                <div>
                <strong>{userData?.nombre || "Voluntario"}</strong>
                <span>{userData?.rol || "voluntario"}</span>
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

        <div className="volunteer-body">
            <aside className={`volunteer-sidebar ${openSidebar ? "open" : ""}`}>
                <button
                    className="close-sidebar"
                    onClick={() => setOpenSidebar(false)}
                >
                    ✕
                </button>

                <Link to="/volunteer" onClick={() => setOpenSidebar(false)}>
                    🏠 Inicio
                </Link>

                <Link to="/volunteer/campaigns" onClick={() => setOpenSidebar(false)}>
                    🌿 Campañas disponibles
                </Link>

                <Link to="/my-applications" onClick={() => setOpenSidebar(false)}>
                    📋 Mis postulaciones
                </Link>

                <Link to="/volunteer/support" onClick={() => setOpenSidebar(false)}>
                    💬 Soporte y contacto
                </Link>

                <Link to="/volunteer/profile" onClick={() => setOpenSidebar(false)}>
                    👤 Mi Perfil
                </Link>

                <button onClick={handleLogout} className="sidebar-logout">
                    🚪 Cerrar sesión
                </button>
            </aside>

            <main className="volunteer-content">{children}</main>
        </div>
        </div>
    );
}

export default VolunteerLayout;