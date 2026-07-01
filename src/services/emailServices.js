import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_4y5j138";

const TEMPLATE_APPROVED = "template_pjmpre5";
const TEMPLATE_REJECTED = "template_ea1qhak";

const PUBLIC_KEY = "BfzXMjEsg3P3D6rvJ";

export const sendApplicationEmail = async ({
    toEmail,
    toName,
    campaignName,
    campaignDate,
    campaignLocation,
    campaignDescription,
    applicationStatus,
    rejectionReason = "",
    }) => {

    const templateId =
        applicationStatus === "APROBADA"
        ? TEMPLATE_APPROVED
        : TEMPLATE_REJECTED;

    return emailjs.send(
        SERVICE_ID,
        templateId,
        {
        to_email: toEmail,
        to_name: toName,

        campaign_name: campaignName,
        campaign_date: campaignDate,
        campaign_location: campaignLocation,
        campaign_description: campaignDescription,

        rejection_reason: rejectionReason,
        },
        PUBLIC_KEY
    );
};