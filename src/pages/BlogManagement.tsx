import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading-spinner";
import { Plus, Edit, Trash, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  published: boolean;
  published_at: string | null;
  view_count: number;
  created_at: string;
}

export default function BlogManagement() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchArticles();
    }
  }, [user, authLoading, navigate]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title, description, category, published, published_at, view_count, created_at")
        .eq("author_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast({
        title: "Error",
        description: "Failed to load articles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Article deleted successfully",
      });

      setArticles(articles.filter((a) => a.id !== deleteId));
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  if (authLoading || loading) {
    return <PageLoader />;
  }

  return (
    <>
      <SEOHead
        title="Manage Articles - LinkPeek"
        description="Manage your blog articles and content"
        noindex={true}
      />

      <div className="min-h-screen bg-background">
        <PageHeader showBack title="LinkPeek" />

        <div className="container mx-auto px-6 py-10 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Manage Articles</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage your blog content
              </p>
            </div>
            <Button onClick={() => navigate("/blog/new")}>
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </div>

          {articles.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                No articles yet. Create your first article to get started.
              </p>
              <Button onClick={() => navigate("/blog/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Article
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <Card key={article.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{article.title}</h3>
                        <Badge variant={article.published ? "default" : "secondary"}>
                          {article.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {article.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{article.category}</span>
                        <span>•</span>
                        <span>
                          {article.published_at
                            ? format(new Date(article.published_at), "MMM d, yyyy")
                            : format(new Date(article.created_at), "MMM d, yyyy")}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {article.view_count} views
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {article.published && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/blog/${article.slug}`, "_blank")}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/blog/edit/${article.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(article.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
