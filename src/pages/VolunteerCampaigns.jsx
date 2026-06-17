import VolunteerLayout from "../components/VolunteerLayout";

function VolunteerCampaigns() {
  return (
    <VolunteerLayout>
      <section className="dashboard-panel">
        <h2>Campañas disponibles</h2>
        <p className="empty-message">
          Aquí se mostrarán las campañas disponibles para que puedas ver detalles y postular.
        </p>
      </section>
    </VolunteerLayout>
  );
}

export default VolunteerCampaigns;