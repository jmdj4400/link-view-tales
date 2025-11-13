import { Link } from "react-router-dom";
import { FileText, PlusCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AdminNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Admin</span>
          <Badge variant="secondary" className="ml-1">Admin</Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Admin Panel
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link to="/admin" className="cursor-pointer">
            <Shield className="h-4 w-4 mr-2" />
            Admin Dashboard
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Blog Management
        </DropdownMenuLabel>
        
        <DropdownMenuItem asChild>
          <Link to="/blog/manage" className="cursor-pointer">
            <FileText className="h-4 w-4 mr-2" />
            Manage Articles
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/blog/new" className="cursor-pointer">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Article
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
