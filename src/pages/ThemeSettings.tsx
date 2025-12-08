import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeEngineEditor } from "@/components/profile/theme-engine/ThemeEngineEditor";
import { PageLoader } from "@/components/ui/loading-spinner";
import { SEOHead } from "@/components/SEOHead";
import { PageHeader } from "@/components/ui/page-header";

export default function ThemeSettings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <SEOHead
        title="Theme Settings - LinkPeek"
        description="Customize your profile appearance with custom themes and colors."
        noindex={true}
      />
      <div className="min-h-screen bg-background">
        <PageHeader showBack title="LinkPeek" />

        <div className="container mx-auto px-6 py-10 max-w-6xl">
          <ThemeEngineEditor />
        </div>
      </div>
    </>
  );
}
