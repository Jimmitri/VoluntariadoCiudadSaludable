import { Link } from "react-router-dom";
import heroImage from "../assets/images/hero.png";

function Home() {
  return (
    <main className="home">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">🌿 Bienvenido a Ciudad Saludable</span>

          <h1>
            Sé parte del cambio,
            <br />
            sé parte de la <span>solución.</span>
          </h1>

          <p>
            Únete a nuestras campañas ambientales y ayuda a construir un futuro
            más limpio, saludable y sostenible para todos.
          </p>

          <div className="hero-buttons">
            <Link to="/campaigns" className="primary-btn">
              🌿 Ver campañas
            </Link>

            <Link to="/login" className="secondary-btn">
              ⓘ Iniciar sesión
            </Link>
          </div>

          <div className="stats">
            <div className="stat-item">
              <div className="stat-icon">👥</div>
              <div>
                <h3>+1200</h3>
                <p>Voluntarios activos</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">🌳</div>
              <div>
                <h3>+45</h3>
                <p>Campañas realizadas</p>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">🌎</div>
              <div>
                <h3>+10</h3>
                <p>Comunidades impactadas</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <img src={heroImage} alt="Voluntarios ambientales" loading="lazy"/>
        </div>
      </section>
    </main>
  );
}

export default Home;