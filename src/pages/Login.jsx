import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase/config";
import loginImage from "../assets/images/login.png";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError("El usuario no tiene datos registrados.");
        return;
      }

      const userData = userSnap.data();

      if (userData.rol === "administrador") {
        navigate("/admin");
      } else if (userData.rol === "voluntario") {
        navigate("/volunteer");
      } else {
        setError("Rol de usuario no válido.");
      }
    } catch (error) {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage("");

    if (!resetEmail.trim()) {
      setResetMessage("Ingresa tu correo electrónico.");
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, resetEmail);

      setResetMessage(
        "Se envió un enlace de recuperación a tu correo electrónico."
      );
    } catch (error) {
      console.error(error);

      if (error.code === "auth/user-not-found") {
        setResetMessage("No existe una cuenta registrada con este correo.");
      } else if (error.code === "auth/invalid-email") {
        setResetMessage("El correo ingresado no es válido.");
      } else {
        setResetMessage("No se pudo enviar el enlace de recuperación.");
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-container">
        <div className="login-image">
          <img src={loginImage} alt="Naturaleza" />
        </div>

        <div className="login-card">
          <h1>Iniciar sesión</h1>
          <p>Bienvenido de vuelta</p>

          <form onSubmit={handleLogin} className="login-form">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Contraseña</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  setResetEmail("");
                  setResetMessage("");
                  setShowResetModal(true);
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>

              <div className="show-password-container">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />

                <label htmlFor="showPassword">
                  Mostrar contraseña
                </label>
              </div>


            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="auth-link">
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
        </div>

        {showResetModal && (
          <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
            <div className="reset-password-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={() => setShowResetModal(false)}
              >
                ✕
              </button>

              <h2>Recuperar contraseña</h2>
              <p>
                Ingresa tu correo registrado y te enviaremos un enlace para restablecer
                tu contraseña.
              </p>

              <form onSubmit={handleResetPassword}>
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />

                {resetMessage && <p className="reset-message">{resetMessage}</p>}

                <button type="submit" disabled={resetLoading}>
                  {resetLoading ? "Enviando..." : "Enviar enlace"}
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default Login;