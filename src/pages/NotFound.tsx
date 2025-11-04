import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEOHead
        title="Page Not Found - LinkPeek"
        description="The page you're looking for doesn't exist."
        noindex={true}
      />
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <article className="text-center max-w-md space-y-6">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <h2 className="text-2xl font-semibold">Page Not Found</h2>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild>
              <a href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard">
                <Search className="h-4 w-4 mr-2" />
                Go to Dashboard
              </a>
            </Button>
          </div>
        </article>
      </main>
    </>
  );
};

export default NotFound;
