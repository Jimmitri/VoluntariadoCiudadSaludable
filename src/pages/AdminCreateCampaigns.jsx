import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import AdminLayout from "../components/AdminLayout";
import { db, storage } from "../firebase/config";

function AdminCreateCampaigns() {
    const navigate = useNavigate();

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [fecha, setFecha] = useState("");
    const [ubicacion, setUbicacion] = useState("");
    const [vacantes, setVacantes] = useState("");
    const [requisitos, setRequisitos] = useState("");
    const [imagen, setImagen] = useState(null);
    const [preview, setPreview] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (file) {
        setImagen(file);
        setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!imagen) {
        setMessage("Debes seleccionar una imagen para la campaña.");
        return;
        }

        setLoading(true);

        try {
        const imageRef = ref(storage, `campaigns/${Date.now()}-${imagen.name}`);
        await uploadBytes(imageRef, imagen);
        const imageUrl = await getDownloadURL(imageRef);

        await addDoc(collection(db, "campaigns"), {
            nombre,
            descripcion,
            fecha,
            ubicacion,
            vacantes: Number(vacantes),
            requisitos,
            imagen: imageUrl,
            status: "activa",
            createdAt: serverTimestamp(),
        });

        setMessage("Campaña creada correctamente.");

        setNombre("");
        setDescripcion("");
        setFecha("");
        setUbicacion("");
        setVacantes("");
        setRequisitos("");
        setImagen(null);
        setPreview("");

        setTimeout(() => {
            navigate("/admin/campaigns");
        }, 1200);
        } catch (error) {
        console.error(error);
        setMessage("No se pudo crear la campaña.");
        } finally {
        setLoading(false);
        }
    };

    return (
        <AdminLayout>
        <section className="admin-welcome">
            <h1>Crear campaña</h1>
            <p>Registra una nueva campaña ambiental para los voluntarios.</p>
        </section>

        <section className="create-campaign-container">
            <form className="create-campaign-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Nombre de la campaña</label>
                <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                />
            </div>

            <div className="form-group">
                <label>Fecha</label>
                <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                />
            </div>

            <div className="form-group">
                <label>Ubicación</label>
                <input
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                required
                />
            </div>

            <div className="form-group">
                <label>Vacantes</label>
                <input
                type="number"
                min="1"
                value={vacantes}
                onChange={(e) => setVacantes(e.target.value)}
                required
                />
            </div>

            <div className="form-group full">
                <label>Descripción</label>
                <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el objetivo de la campaña."
                required
                />
            </div>

            <div className="form-group full">
                <label>Requisitos</label>
                <textarea
                value={requisitos}
                onChange={(e) => setRequisitos(e.target.value)}
                placeholder="Ejemplo: ropa cómoda, disponibilidad, puntualidad."
                required
                />
            </div>

            {message && <p className="register-message">{message}</p>}

            <button type="submit" className="register-btn" disabled={loading}>
                {loading ? "Creando campaña..." : "Crear campaña"}
            </button>
            </form>

            <div className="campaign-image-panel">
            <h3>Imagen de campaña</h3>
            <p>Selecciona una imagen clara relacionada con la actividad.</p>

            <div className="campaign-image-preview">
                {preview ? (
                <img src={preview} alt="Vista previa campaña" />
                ) : (
                <div className="campaign-preview-placeholder">
                    <p>Vista previa de la imagen</p>
                </div>
                )}
            </div>

            <label className="campaign-upload-btn">
                Seleccionar imagen
                <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>
            </div>
        </section>
        </AdminLayout>
    );
}

export default AdminCreateCampaigns;