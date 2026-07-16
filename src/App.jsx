import { Routes, Route, Navigate } from "react-router";
import { PublicLayout } from "./components/layout/PublicLayout";
import { AuthLayout } from "./components/layout/AuthLayout";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { RequireRole } from "./components/common/RequireRole";

import { Home } from "./pages/public/Home";
import { Plans } from "./pages/public/Plans";
import { HowItWorks } from "./pages/public/HowItWorks";
import { About } from "./pages/public/About";
import { Contact } from "./pages/public/Contact";
import { NotFound } from "./pages/public/NotFound";

import { Login } from "./pages/auth/Login";
import { Onboarding } from "./pages/auth/onboarding/Onboarding";
import { SignupPersonalDetails } from "./pages/auth/onboarding/SignupPersonalDetails";
import { SignupPlanSelection } from "./pages/auth/onboarding/SignupPlanSelection";
import { SignupAccountSetup } from "./pages/auth/onboarding/SignupAccountSetup";
import { SignupConfirmation } from "./pages/auth/onboarding/SignupConfirmation";

import { Dashboard } from "./pages/customer/Dashboard";
import { Claims } from "./pages/customer/Claims";
import { Consultations } from "./pages/customer/Consultations";
import { MyAccount } from "./pages/customer/MyAccount";

import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminClients } from "./pages/admin/AdminClients";
import { AdminClaims } from "./pages/admin/AdminClaims";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Onboarding />}>
          <Route index element={<Navigate to="details" replace />} />
          <Route path="details" element={<SignupPersonalDetails />} />
          <Route path="plan" element={<SignupPlanSelection />} />
          <Route path="account" element={<SignupAccountSetup />} />
          <Route path="confirmation" element={<SignupConfirmation />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<RequireRole role="customer" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/claims" element={<Claims />} />
            <Route path="/consultations" element={<Consultations />} />
            <Route path="/account" element={<MyAccount />} />
          </Route>

          <Route element={<RequireRole role="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/clients" element={<AdminClients />} />
            <Route path="/admin/claims" element={<AdminClaims />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
