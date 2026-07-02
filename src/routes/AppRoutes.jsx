import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import NavBar from "../components/NavBar";
import Loading from "../components/Loading";

const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Campaigns = lazy(() => import("../pages/Campaigns"));
const AdminCampaigns = lazy(() => import("../pages/AdminCampaigns"));
const VolunteerDashboard = lazy(() => import("../pages/VolunteerDashboard"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const VolunteerCampaigns = lazy(() => import("../pages/VolunteerCampaigns"));
const AdminCreateCampaigns = lazy(() => import("../pages/AdminCreateCampaigns"));
const VolunteerMyApplications = lazy(() => import("../pages/VolunteerMyApplications"));
const AdminApplications = lazy(() => import("../pages/AdminApplications"));
const AdminParticipants = lazy(() => import("../pages/AdminParticipants"));
const VolunteerSupport = lazy(() => import("../pages/VolunteerSupport"));
const AdminContactRequests = lazy(() => import("../pages/AdminContactRequests"));
const VolunteerProfile = lazy(() => import("../pages/VolunteerProfile"));

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
        <Suspense fallback={<Loading />}>
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
                <Route path="/my-applications" element={<VolunteerMyApplications />} />
                <Route path="/admin/applications" element={<AdminApplications />} />
                <Route path="/admin/participants" element={<AdminParticipants />} />
                <Route path="/volunteer/support" element={<VolunteerSupport />} />
                <Route path="/admin/contact-requests" element={<AdminContactRequests />} />
                <Route path="/volunteer/profile" element={<VolunteerProfile />} />
            </Routes>
        </Suspense>
    );
}

export default AppRoutes;