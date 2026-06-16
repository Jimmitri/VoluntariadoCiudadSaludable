import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Campaigns from "../pages/Campaigns";
import CampaignDetail from "../pages/CampaignDetail";
import ApplyCampaign from "../pages/ApplyCampaign";
import AdminCampaigns from "../pages/AdminCampaigns";
import VolunteerDashboard from "../pages/VolunteerDashboard";
import AdminDashboard from "../pages/AdminDashboard";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaign/:id" element={<CampaignDetail />} />
            <Route path="/apply/:id" element={<ApplyCampaign />} />
            <Route path="/admin/campaigns" element={<AdminCampaigns />} />
            <Route path="/volunteer" element={<VolunteerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
    );
}

export default AppRoutes;