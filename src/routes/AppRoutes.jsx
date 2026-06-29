import { Routes, Route } from "react-router-dom";
import NavBar from "../components/NavBar";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Campaigns from "../pages/Campaigns";
import ApplyCampaign from "../pages/ApplyCampaign";
import AdminCampaigns from "../pages/AdminCampaigns";
import VolunteerDashboard from "../pages/VolunteerDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import VolunteerCampaigns from "../pages/VolunteerCampaigns";

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
        <Route path="/apply/:id" element={<ApplyCampaign />} />

        <Route path="/volunteer" element={<VolunteerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/campaigns" element={<AdminCampaigns />} />
        <Route path="/volunteer/campaigns" element={<VolunteerCampaigns />} />
        <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
    );
}

export default AppRoutes;