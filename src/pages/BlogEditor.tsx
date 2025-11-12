import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loading-spinner";
import { toast } from "@/hooks/use-toast";
import { Save, Eye } from "lucide-react";

export default function BlogEditor() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    category: "",
    tags: [] as string[],
    featured_image_url: "",
    published: false,
    author_name: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user && id) {
      fetchArticle();
    }
  }, [user, authLoading, navigate, id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      setFormData({
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: data.content,
        category: data.category,
        tags: data.tags || [],
        featured_image_url: data.featured_image_url || "",
        published: data.published,
        author_name: data.author_name,
      });
    } catch (error) {
      console.error("Error fetching article:", error);
      toast({
        title: "Error",
        description: "Failed to load article",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Title, content, and category are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const slug = formData.slug || generateSlug(formData.title);
      const articleData = {
        ...formData,
        slug,
        author_id: user!.id,
        author_name: formData.author_name || user!.email || "Anonymous",
        published_at: formData.published ? new Date().toISOString() : null,
      };

      if (id) {
        const { error } = await supabase
          .from("articles")
          .update(articleData)
          .eq("id", id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("articles")
          .insert([articleData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: id ? "Article updated successfully" : "Article created successfully",
      });

      navigate("/blog/manage");
    } catch (error) {
      console.error("Error saving article:", error);
      toast({
        title: "Error",
        description: "Failed to save article",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <PageLoader />;
  }

  return (
    <>
      <SEOHead
        title={id ? "Edit Article - LinkPeek" : "New Article - LinkPeek"}
        description="Create and publish articles"
        noindex={true}
      />

      <div className="min-h-screen bg-background">
        <PageHeader showBack title="LinkPeek" />

        <div className="container mx-auto px-6 py-10 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">
              {id ? "Edit Article" : "New Article"}
            </h1>
            <div className="flex gap-2">
              {formData.published && formData.slug && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`/blog/${formData.slug}`, "_blank")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Article title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generated-from-title"
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to auto-generate from title
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description for SEO (160 characters max)"
                rows={3}
                maxLength={160}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Tutorial, Analysis, News"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author_name">Author Name</Label>
              <Input
                id="author_name"
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                placeholder="Display name for author"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                  })
                }
                placeholder="seo, marketing, analytics"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="featured_image">Featured Image URL</Label>
              <Input
                id="featured_image"
                value={formData.featured_image_url}
                onChange={(e) =>
                  setFormData({ ...formData, featured_image_url: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (Markdown supported) *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your article content here... You can use markdown formatting."
                rows={20}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, published: checked })
                }
              />
              <Label htmlFor="published" className="cursor-pointer">
                Publish article (make visible to public)
              </Label>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
