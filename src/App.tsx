import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import Landing from "./pages/Landing";
import Beta from "./pages/Beta";
import Offline from "./pages/Offline";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProfileAnalytics from "./pages/ProfileAnalytics";
import Onboarding from "./pages/Onboarding";
import ProfileSettings from "./pages/ProfileSettings";
import LinksSettings from "./pages/LinksSettings";
import ThemeSettings from "./pages/ThemeSettings";
import LeadsManagement from "./pages/LeadsManagement";
import ConversionTracking from "./pages/ConversionTracking";
import Insights from "./pages/Insights";
import Billing from "./pages/Billing";
import PublicProfile from "./pages/PublicProfile";
import RedirectHandler from "./pages/RedirectHandler";
import NotFound from "./pages/NotFound";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import HelpCenter from "./pages/HelpCenter";
import ContactSupport from "./pages/ContactSupport";
import VerifyEmail from "./pages/VerifyEmail";
import EmailConfirmed from "./pages/EmailConfirmed";
import PublicScorecard from "./pages/PublicScorecard";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <InstallPrompt />
          <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/beta" element={<Beta />} />
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/email-confirmed" element={<EmailConfirmed />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<ProfileAnalytics />} />
              <Route path="/settings/profile" element={<ProfileSettings />} />
              <Route path="/settings/links" element={<LinksSettings />} />
              <Route path="/settings/theme" element={<ThemeSettings />} />
              <Route path="/settings/leads" element={<LeadsManagement />} />
              <Route path="/settings/conversions" element={<ConversionTracking />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="/contact" element={<ContactSupport />} />
              <Route path="/offline" element={<Offline />} />
              <Route path="/r/:linkId" element={<RedirectHandler />} />
              <Route path="/:handle/scorecard" element={<PublicScorecard />} />
              <Route path="/:handle" element={<PublicProfile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
