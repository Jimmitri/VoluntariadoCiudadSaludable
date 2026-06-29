import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { auth, db, storage } from "../firebase/config";
import registerImage from "../assets/images/register.png";

function Register() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [distrito, setDistrito] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [disponibilidad, setDisponibilidad] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [foto, setFoto] = useState(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [fotoPreview, setFotoPreview] = useState("");

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push("Debe tener al menos 8 caracteres.");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Debe contener al menos una letra mayúscula.");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Debe contener al menos una letra minúscula.");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Debe contener al menos un número.");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Debe contener al menos un carácter especial.");
    }

    return errors;
  };
  
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    const passwordErrors = validatePassword(password);

    if (passwordErrors.length > 0) {
      setMessage(passwordErrors.join(" "));
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    if (!acceptTerms) {
      setMessage("Debes aceptar los términos y condiciones.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        correo,
        password
      );

      const uid = userCredential.user.uid;
      let fotoUrl = "";

      if (foto) {
        const fotoRef = ref(storage, `users/${uid}/profile.jpg`);
        await uploadBytes(fotoRef, foto);
        fotoUrl = await getDownloadURL(fotoRef);
      }

      await setDoc(doc(db, "users", uid), {
        nombre,
        correo,
        email: correo,
        telefono,
        distrito,
        fechaNacimiento,
        disponibilidad,
        experiencia,
        fotoUrl,
        rol: "voluntario",
        estado: "activo",
        createdAt: serverTimestamp(),
      });

      setMessage("Cuenta creada correctamente.");
      setTimeout(() => {
        navigate("/volunteer");
      }, 1200);
    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        setMessage("El correo ya está registrado.");
      } else if (error.code === "auth/weak-password") {
        setMessage("La contraseña debe tener al menos 6 caracteres.");
      } else {
        setMessage("No se pudo crear la cuenta.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-container">
        <div className="register-image">
          <img src={registerImage} alt="Voluntariado ambiental" />
        </div>

        <div className="register-card">
          <h1>Crear cuenta</h1>
          <p>Regístrate como voluntario ambiental.</p>

          <form className="register-form" onSubmit={handleRegister}>
            <div className="register-grid">
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Distrito</label>
                <input
                  type="text"
                  value={distrito}
                  onChange={(e) => setDistrito(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha de nacimiento</label>
                <input
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Disponibilidad</label>
                <select
                  value={disponibilidad}
                  onChange={(e) => setDisponibilidad(e.target.value)}
                  required
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Fines de semana">Fines de semana</option>
                  <option value="Entre semana">Entre semana</option>
                  <option value="Ambos">Ambos</option>
                </select>
              </div>

              <div className="form-group full">
                <label>Experiencia previa</label>
                <textarea
                  placeholder="Opcional: comenta si has participado antes en voluntariados."
                  value={experiencia}
                  onChange={(e) => setExperiencia(e.target.value)}
                />
              </div>

              <div className="form-group full">
                <label>Foto de perfil (opcional)</label>

                <div className="photo-upload-box">
                  <div className="photo-preview">
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Vista previa" />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>

                  <div className="photo-upload-info">
                    <p>Sube una imagen para tu perfil</p>

                    <label className="photo-upload-btn">
                      Seleccionar imagen
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];

                          if (file) {
                            setFoto(file);
                            setFotoPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="terms-row">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />

              <span>
                Acepto los{" "}
                <button
                  type="button"
                  className="terms-link"
                  onClick={() => setShowTerms(true)}
                >
                  Términos y Condiciones
                </button>
              </span>
            </div>

            {message && <p className="register-message">{message}</p>}

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="auth-link">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </section>

      {showTerms && (
        <div className="terms-overlay" onClick={() => setShowTerms(false)}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTerms(false)}>
              ✕
            </button>

            <h2>Términos y Condiciones</h2>

            <p>
              Estos términos regulan el uso de la plataforma Ciudad Saludable,
              destinada a la gestión de voluntarios ambientales.
            </p>

            <h3>1. Registro</h3>
            <p>
              La información proporcionada deberá ser verdadera, actualizada y
              utilizada únicamente para fines de participación en campañas.
            </p>

            <h3>2. Protección de datos</h3>
            <p>
              Los datos personales serán utilizados únicamente para la gestión de
              campañas, postulaciones y comunicación con los voluntarios.
            </p>

            <h3>3. Participación</h3>
            <p>
              La postulación a una campaña representa la intención de participar.
              La organización podrá aprobar o rechazar postulaciones según los
              requisitos establecidos.
            </p>

            <h3>4. Conducta</h3>
            <p>
              Los voluntarios deberán mantener respeto hacia organizadores,
              participantes y comunidad durante las actividades.
            </p>

            <h3>5. Cancelación</h3>
            <p>
              Ciudad Saludable podrá modificar o cancelar campañas por motivos
              climáticos, logísticos o de seguridad.
            </p>

            <button className="terms-close-btn" onClick={() => setShowTerms(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Register;