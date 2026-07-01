const {onSchedule} = require("firebase-functions/v2/scheduler");
const {defineSecret} = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const db = admin.firestore();

const EMAIL_USER = defineSecret("EMAIL_USER");
const EMAIL_PASS = defineSecret("EMAIL_PASS");

function getTomorrowDate() {
    const now = new Date();

    const peruDate = new Date(
        now.toLocaleString("en-US", {timeZone: "America/Lima"})
    );

    peruDate.setDate(peruDate.getDate() + 1);

    const year = peruDate.getFullYear();
    const month = String(peruDate.getMonth() + 1).padStart(2, "0");
    const day = String(peruDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
    }

    function buildTeamList(teamMembers) {
    if (!teamMembers.length) return "Aún no hay equipo asignado.";

    const ordered = [...teamMembers].sort((a, b) => {
        const roleA = (a.participationRole || "").toLowerCase().trim();
        const roleB = (b.participationRole || "").toLowerCase().trim();

        if (roleA === "lider" && roleB !== "lider") return -1;
        if (roleA !== "lider" && roleB === "lider") return 1;

        return (a.userName || "").localeCompare(b.userName || "");
    });

    return ordered
        .map((member) => {
        const role =
            (member.participationRole || "").toLowerCase().trim() === "lider"
            ? "Líder"
            : "Integrante";

        return `
            <div style="padding:10px 0;border-bottom:1px solid #e6ece7;">
            <strong style="color:#073b20;">
                ${role === "Líder" ? "👑 " : ""}${member.userName || "Voluntario"}
            </strong>
            <p style="margin:4px 0;color:#526058;font-size:13px;">
                ${role}
            </p>
            <p style="margin:4px 0;color:#526058;font-size:13px;">
                📞 ${member.userPhone || "Sin teléfono registrado"}
            </p>
            <p style="margin:4px 0;color:#526058;font-size:13px;">
                Función: ${member.task || "Aún no asignada"}
            </p>
            </div>
        `;
        })
        .join("");
    }

    function buildReminderHtml(application, teamHtml) {
    const role =
        (application.participationRole || "").toLowerCase().trim() === "lider"
        ? "Líder"
        : "Integrante";

    return `
    <div style="margin:0;padding:0;background:#f4f8f4;font-family:Arial,Helvetica,sans-serif;">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e4eee6;">
        
        <div style="background:#073b20;padding:26px;text-align:center;color:#ffffff;">
            <h1 style="margin:0;font-size:26px;">🌿 Ciudad Saludable</h1>
            <p style="margin:8px 0 0;font-size:14px;">Recordatorio de participación</p>
        </div>

        <div style="padding:28px;">
            <p style="font-size:15px;color:#526058;margin:0 0 18px;">
            Hola <strong style="color:#073b20;">${application.userName || "Voluntario"}</strong>,
            </p>

            <div style="background:#e8f5e9;border-left:5px solid #2e7d32;border-radius:14px;padding:18px;margin-bottom:22px;">
            <h2 style="margin:0;color:#073b20;font-size:22px;">
                Te recordamos tu participación
            </h2>
            <p style="margin:10px 0 0;color:#526058;font-size:15px;line-height:1.6;">
                Mañana participarás en la siguiente campaña ambiental.
            </p>
            </div>

            <h2 style="color:#073b20;font-size:24px;margin:0 0 14px;">
            ${application.campaignName || "Campaña"}
            </h2>

            <div style="background:#f8fbf8;border-radius:14px;padding:16px;margin-bottom:20px;">
            <p style="margin:0 0 8px;color:#526058;font-size:14px;">
                <strong style="color:#102015;">📅 Fecha:</strong> ${application.campaignDate || "Fecha no registrada"}
            </p>
            <p style="margin:0;color:#526058;font-size:14px;">
                <strong style="color:#102015;">📍 Ubicación:</strong> ${application.campaignLocation || "Ubicación no registrada"}
            </p>
            </div>

            <div style="margin-bottom:22px;">
            <h3 style="color:#073b20;margin:0 0 8px;font-size:18px;">Sobre la campaña</h3>
            <p style="color:#526058;font-size:14px;line-height:1.6;margin:0;">
                ${application.campaignDescription || "Sin descripción registrada."}
            </p>
            </div>

            <div style="background:#f8fbf8;border-radius:14px;padding:16px;margin-bottom:20px;">
            <h3 style="color:#073b20;margin:0 0 10px;font-size:18px;">Tu participación</h3>

            <p style="margin:0 0 8px;color:#526058;font-size:14px;">
                <strong style="color:#102015;">Rol:</strong> ${role}
            </p>

            <p style="margin:0 0 8px;color:#526058;font-size:14px;">
                <strong style="color:#102015;">Grupo:</strong> ${application.groupName || "Aún no asignado"}
            </p>

            ${
                role !== "Líder"
                ? `<p style="margin:0 0 8px;color:#526058;font-size:14px;">
                    <strong style="color:#102015;">Líder:</strong> ${application.leaderName || "Aún no asignado"}
                    </p>`
                : ""
            }

            <p style="margin:0;color:#526058;font-size:14px;">
                <strong style="color:#102015;">Función:</strong> ${application.task || "Aún no asignada"}
            </p>
            </div>

            <div style="background:#fff8e1;border-left:5px solid #d68910;border-radius:12px;padding:14px;margin-bottom:22px;">
            <h3 style="color:#102015;margin:0 0 8px;font-size:16px;">
                Equipo asignado
            </h3>
            ${teamHtml}
            </div>

            <p style="color:#526058;font-size:14px;line-height:1.6;margin:0;">
            Recuerda llegar con anticipación y llevar ropa cómoda. Gracias por formar parte de Ciudad Saludable.
            </p>
        </div>

        <div style="background:#f4f8f4;padding:18px;text-align:center;color:#526058;font-size:13px;">
            Equipo Ciudad Saludable
        </div>
        </div>
    </div>
    `;
    }

    exports.sendCampaignReminders = onSchedule(
    {
        schedule: "every day 08:00",
        timeZone: "America/Lima",
        secrets: [EMAIL_USER, EMAIL_PASS],
    },
    async () => {
        const tomorrow = getTomorrowDate();

        logger.info(`Buscando recordatorios para: ${tomorrow}`);

        const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: EMAIL_USER.value(),
            pass: EMAIL_PASS.value(),
        },
        });

        const applicationsSnapshot = await db
        .collection("applications")
        .where("estado", "==", "aceptada")
        .where("campaignDate", "==", tomorrow)
        .where("reminderSent", "==", false)
        .get();

        if (applicationsSnapshot.empty) {
        logger.info("No hay recordatorios pendientes.");
        return;
        }

        for (const docSnap of applicationsSnapshot.docs) {
        const application = {
            id: docSnap.id,
            ...docSnap.data(),
        };

        if (!application.userEmail) {
            logger.warn(`Aplicación sin correo: ${application.id}`);
            continue;
        }

        let teamMembers = [];

        if (application.campaignId && application.groupName) {
            const teamSnapshot = await db
            .collection("applications")
            .where("campaignId", "==", application.campaignId)
            .where("groupName", "==", application.groupName)
            .get();

            teamMembers = teamSnapshot.docs.map((teamDoc) => ({
            id: teamDoc.id,
            ...teamDoc.data(),
            }));
        }

        const teamHtml = buildTeamList(teamMembers);
        const html = buildReminderHtml(application, teamHtml);

        await transporter.sendMail({
            from: `"Ciudad Saludable" <${EMAIL_USER.value()}>`,
            to: application.userEmail,
            subject: "Recordatorio de campaña | Ciudad Saludable",
            html,
        });

        await docSnap.ref.update({
            reminderSent: true,
            reminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        logger.info(`Recordatorio enviado a ${application.userEmail}`);
        }
    },
);
