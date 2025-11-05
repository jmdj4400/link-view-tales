import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye } from "lucide-react";
import { ThemeCustomizer } from "@/components/profile/ThemeCustomizer";
import { PageLoader } from "@/components/ui/loading-spinner";
import { SEOHead } from "@/components/SEOHead";

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
        <nav className="border-b">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-10 max-w-6xl">
          <ThemeCustomizer />
        </div>
      </div>
    </>
  );
}
