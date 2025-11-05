import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface PageHeaderProps {
  showBack?: boolean;
  showHome?: boolean;
  title?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ showBack = false, showHome = true, title, actions }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <nav className="border-b bg-background sticky top-0 z-50" role="navigation">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBack && (
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          {showHome && !showBack && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          )}
          {title && <h1 className="text-xl font-heading font-semibold ml-2">{title}</h1>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
