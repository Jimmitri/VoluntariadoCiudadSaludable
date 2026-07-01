import { Routes, Route } from "react-router-dom";
import NavBar from "../components/NavBar";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Campaigns from "../pages/Campaigns";
import AdminCampaigns from "../pages/AdminCampaigns";
import VolunteerDashboard from "../pages/VolunteerDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import VolunteerCampaigns from "../pages/VolunteerCampaigns";
import AdminCreateCampaigns from "../pages/AdminCreateCampaigns";
import VolunteerMyApplications from "../pages/VolunteerMyApplications";
import AdminApplications from "../pages/AdminApplications";
import AdminParticipants from "../pages/AdminParticipants";
import VolunteerSupport from "../pages/VolunteerSupport";
import AdminContactRequests from "../pages/AdminContactRequests";
import VolunteerProfile from "../pages/VolunteerProfile";

function PublicPage({ children }) {
    return (
        <>
        <NavBar />
        {children}
        </>
    );
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<PublicPage><Home /></PublicPage>} />
            <Route path="/login" element={<PublicPage><Login /></PublicPage>} />
            <Route path="/register" element={<PublicPage><Register /></PublicPage>} />
            <Route path="/campaigns" element={<PublicPage><Campaigns /></PublicPage>} />
            <Route path="/admin/create-campaign" element={<AdminCreateCampaigns />} />

            <Route path="/volunteer" element={<VolunteerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/campaigns" element={<AdminCampaigns />} />
            <Route path="/volunteer/campaigns" element={<VolunteerCampaigns />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/my-applications" element={<VolunteerMyApplications />} />
            <Route path="/admin/applications" element={<AdminApplications />} />
            <Route path="/admin/participants" element={<AdminParticipants />} />
            <Route path="/volunteer/support" element={<VolunteerSupport />} />
            <Route path="/admin/contact-requests" element={<AdminContactRequests />} />
            <Route path="/volunteer/profile" element={<VolunteerProfile />} /> 
        </Routes>
    );
}

export default AppRoutes;