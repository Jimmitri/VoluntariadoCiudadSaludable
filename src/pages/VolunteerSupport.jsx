import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import VolunteerLayout from "../components/VolunteerLayout";

function VolunteerSupport() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [sendMessage, setSendMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const organizationPhone = "51999999999";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSendMessage("");

        const user = auth.currentUser;

        if (!user) {
        setSendMessage("Debes iniciar sesión para enviar una consulta.");
        return;
        }

        if (!subject.trim() || !message.trim()) {
        setSendMessage("Completa el asunto y el mensaje.");
        return;
        }

        setLoading(true);

        try {
        await addDoc(collection(db, "contactRequests"), {
            userId: user.uid,
            userName: user.displayName || "Voluntario",
            userEmail: user.email,
            userPhone: "",
            subject,
            message,
            status: "pendiente",
            createdAt: serverTimestamp(),
        });

        setSubject("");
        setMessage("");
        setSendMessage("Consulta enviada correctamente.");
        } catch (error) {
        console.error(error);
        setSendMessage("No se pudo enviar la consulta.");
        } finally {
        setLoading(false);
        }
    };

    const whatsappMessage = encodeURIComponent(
        "Hola, soy voluntario de Ciudad Saludable y necesito realizar una consulta."
    );

    return (
        <VolunteerLayout>
        <section className="dashboard-welcome">
            <h1>Soporte y contacto</h1>
            <p>
            Revisa preguntas frecuentes o envía una consulta a la organización.
            </p>
        </section>

        <section className="support-panel">
            <h2>Preguntas frecuentes</h2>

            <div className="faq-list">
            <div className="faq-item">
                <h3>¿Cómo sé si fui aceptado en una campaña?</h3>
                <p>
                Puedes revisar el estado desde la sección Mis postulaciones.
                También recibirás una notificación por correo.
                </p>
            </div>

            <div className="faq-item">
                <h3>¿Dónde veo mi función asignada?</h3>
                <p>
                En Mis postulaciones, selecciona la campaña aceptada para ver tu
                rol, grupo, líder y función asignada.
                </p>
            </div>

            <div className="faq-item">
                <h3>¿Qué pasa si no puedo asistir?</h3>
                <p>
                Debes comunicarte con la organización lo antes posible para que
                puedan reorganizar el equipo.
                </p>
            </div>

            <div className="faq-item">
                <h3>¿Cómo contacto a mi líder?</h3>
                <p>
                Cuando el administrador asigne los equipos, podrás ver el teléfono
                de tu líder en el detalle de la campaña.
                </p>
            </div>
            </div>
        </section>

        <section className="support-panel">
            <h2>Enviar consulta</h2>

            <form className="support-form" onSubmit={handleSubmit}>
            <label>Asunto</label>
            <input
                type="text"
                placeholder="Ej. Consulta sobre una campaña"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
            />

            <label>Mensaje</label>
            <textarea
                placeholder="Escribe tu consulta..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />

            {sendMessage && <p className="admin-action-message">{sendMessage}</p>}

            <button type="submit" disabled={loading}>
                {loading ? "Enviando..." : "Enviar consulta"}
            </button>
            </form>
        </section>

        <section className="support-panel whatsapp-panel">
            <h2>Contacto directo</h2>
            <p>
            También puedes comunicarte directamente con la organización mediante
            WhatsApp.
            </p>

            <a
            href={`https://wa.me/${organizationPhone}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="whatsapp-btn"
            >
            Contactar por WhatsApp
            </a>
        </section>
        </VolunteerLayout>
    );
}

export default VolunteerSupport;