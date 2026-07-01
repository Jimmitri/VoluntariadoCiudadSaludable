import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import AdminLayout from "../components/AdminLayout";

function AdminContactRequests() {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState("pendiente");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const q = query(
            collection(db, "contactRequests"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {

            const data = await Promise.all(
                snapshot.docs.map(async (document) => {

                    const request = {
                        id: document.id,
                        ...document.data(),
                    };

                    try {
                        const userSnap = await getDoc(
                            doc(db, "users", request.userId)
                        );

                        if (userSnap.exists()) {
                            request.userPhone = userSnap.data().telefono || "";
                        } else {
                            request.userPhone = "";
                        }
                    } catch (error) {
                        console.error(error);
                        request.userPhone = "";
                    }

                    return request;
                })
            );

            setRequests(data);
        });

        return () => unsubscribe();

    }, []);

    const filteredRequests =
        filter === "todas"
        ? requests
        : requests.filter((req) => req.status === filter);

    const markAsAnswered = async (id) => {
        try {
        await updateDoc(doc(db, "contactRequests", id), {
            status: "respondida",
            answeredAt: serverTimestamp(),
        });

        setMessage("Solicitud marcada como respondida.");
        setTimeout(() => setMessage(""), 2500);
        } catch (error) {
        console.error(error);
        setMessage("No se pudo actualizar la solicitud.");
        }
    };

    const buildWhatsappUrl = (request) => {

        const phone = request.userPhone || "";

        if (!phone) return null;

        const cleanPhone = phone.replace(/\D/g, "");

        const text = encodeURIComponent(
            `Hola ${request.userName || "voluntario"}, te escribimos de Ciudad Saludable respecto a tu consulta: "${request.subject}".`
        );

        return `https://wa.me/51${cleanPhone}?text=${text}`;
    };

    return (
        <AdminLayout>
        <section className="admin-welcome">
            <h1>Solicitudes de contacto</h1>
            <p>
            Revisa las consultas enviadas por los voluntarios y responde mediante
            WhatsApp si es necesario.
            </p>
        </section>

        <section className="admin-applications-panel">
            <div className="applications-filters">
            {["pendiente", "respondida", "todas"].map((item) => (
                <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
                >
                {item}
                </button>
            ))}
            </div>

            {message && <p className="admin-action-message">{message}</p>}

            {filteredRequests.length === 0 ? (
            <p className="empty-message">No hay solicitudes para este filtro.</p>
            ) : (
            <div className="contact-requests-list">
                {filteredRequests.map((request) => {

                return (
                    <article className="contact-request-card" key={request.id}>
                    <div>
                        <h3>{request.subject}</h3>

                        <p>
                        <strong>Voluntario:</strong>{" "}
                        {request.userName || "No especificado"}
                        </p>

                        <p>
                        <strong>Correo:</strong>{" "}
                        {request.userEmail || "No especificado"}
                        </p>

                        <p>
                        <strong>Teléfono:</strong>{" "}
                        {request.userPhone || "No registrado"}
                        </p>

                        <p>
                        <strong>Mensaje:</strong> {request.message}
                        </p>
                    </div>

                    <div className="contact-request-actions">
                        <span className={`application-status ${request.status}`}>
                        {request.status}
                        </span>

                        {request.userPhone ? (
                            <a
                                href={buildWhatsappUrl(request)}
                                target="_blank"
                                rel="noreferrer"
                                className="whatsapp-btn small"
                            >
                                Responder WhatsApp
                            </a>
                        ) : (
                            <p className="empty-small">
                                No tiene numero registrado.
                            </p>
                        )}

                        {request.status !== "respondida" && (
                        <button
                            className="approve-btn"
                            onClick={() => markAsAnswered(request.id)}
                        >
                            Marcar respondida
                        </button>
                        )}
                    </div>
                    </article>
                );
                })}
            </div>
            )}
        </section>
        </AdminLayout>
    );
}

export default AdminContactRequests;