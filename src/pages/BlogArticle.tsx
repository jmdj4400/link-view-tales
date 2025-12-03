import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading-spinner";
import { Calendar, Clock, Eye, Tag, ArrowLeft, Share2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  author_name: string;
  category: string;
  tags: string[];
  featured_image_url: string | null;
  published_at: string;
  reading_time_minutes: number;
  view_count: number;
}

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error) throw error;

      if (!data) {
        navigate("/404");
        return;
      }

      setArticle(data);

      // Increment view count
      await supabase
        .from("articles")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", data.id);

      // Fetch related articles
      const { data: related } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .eq("category", data.category)
        .neq("id", data.id)
        .limit(3);

      setRelatedArticles(related || []);
    } catch (error) {
      console.error("Error fetching article:", error);
      navigate("/404");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.description,
          url,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Article link copied to clipboard",
      });
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!article) {
    return null;
  }

  const articleUrl = `https://link-peek.org/blog/${article.slug}`;

  return (
    <>
      <SEOHead
        title={`${article.title} - LinkPeek Blog`}
        description={article.description}
        canonicalUrl={`https://link-peek.org/blog/${article.slug}`}
        ogImage={article.featured_image_url || undefined}
      />

      {/* JSON-LD Structured Data for Article */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: article.title,
          description: article.description,
          image: article.featured_image_url,
          datePublished: article.published_at,
          author: {
            "@type": "Person",
            name: article.author_name,
          },
          publisher: {
            "@type": "Organization",
            name: "LinkPeek",
            logo: {
              "@type": "ImageObject",
              url: "https://link-peek.org/logo.png",
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": articleUrl,
          },
          keywords: article.tags.join(", "),
          articleSection: article.category,
          wordCount: article.content.split(/\s+/).length,
        })}
      </script>

      <div className="min-h-screen bg-background">
        <PageHeader showBack title="LinkPeek" />

        {/* Article Header */}
        <article className="container mx-auto px-6 py-8 max-w-4xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/blog")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>

          {/* Featured Image */}
          {article.featured_image_url && (
            <div className="aspect-video overflow-hidden rounded-lg mb-8">
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Category & Meta */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <Badge variant="secondary">{article.category}</Badge>
            <span className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              {format(new Date(article.published_at), "MMMM d, yyyy")}
            </span>
            <span className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {article.reading_time_minutes} min read
            </span>
            <span className="flex items-center text-sm text-muted-foreground">
              <Eye className="h-4 w-4 mr-1" />
              {article.view_count} views
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Author & Share */}
          <div className="flex items-center justify-between mb-8 pb-8 border-b">
            <div>
              <p className="text-lg text-muted-foreground">By {article.author_name}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Content */}
          <div
            className="prose prose-lg dark:prose-invert max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-12">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="border-t pt-12">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    to={`/blog/${related.slug}`}
                    className="group"
                  >
                    <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-muted">
                      {related.featured_image_url && (
                        <img
                          src={related.featured_image_url}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(related.published_at), "MMM d, yyyy")}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </>
  );
}
