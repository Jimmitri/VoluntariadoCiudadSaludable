import { Link } from "react-router-dom";
import logo from "../assets/images/logo.avif";

function NavBar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <img
                src={logo}
                alt="Ciudad Saludable"
                loading="lazy"
                className="company-logo"
            />
        <div>
          <h2>Ciudad Saludable</h2>
          <p>Juntos por un planeta mejor</p>
        </div>
      </Link>

      <div className="nav-actions">
        <Link to="/login" className="btn-outline">Iniciar sesión</Link>
        <Link to="/register" className="btn-solid">Registrarse</Link>
      </div>
    </nav>
  );
}

export default NavBar;