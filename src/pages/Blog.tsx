import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading-spinner";
import { Calendar, Clock, Search, Tag } from "lucide-react";
import { format } from "date-fns";

interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  author_name: string;
  category: string;
  tags: string[];
  featured_image_url: string | null;
  published_at: string;
  reading_time_minutes: number;
  view_count: number;
}

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9;

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      setArticles(data || []);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data?.map((article) => article.category))
      );
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value) {
      setSearchParams({ q: value, category: selectedCategory });
    } else {
      setSearchParams({ category: selectedCategory });
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchParams({ category, ...(searchQuery && { q: searchQuery }) });
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <SEOHead
        title="Blog & Analysis - LinkPeek | Link Management Insights & Best Practices"
        description="Expert analysis, guides, and insights on link management, bio link optimization, social media strategies, and digital marketing analytics. Stay updated with LinkPeek's latest articles."
        canonicalUrl="https://link-peek.org/blog"
      />

      <div className="min-h-screen bg-background">
        <PageHeader showBack title="LinkPeek" />

        {/* Hero Section */}
        <section className="border-b bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-6 py-16 max-w-6xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
              Blog & Analysis
            </h1>
            <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-8">
              Expert insights on link management, social media optimization, and digital marketing strategies
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6 py-4 max-w-6xl">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange("all")}
              >
                All Articles
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="container mx-auto px-6 py-12 max-w-6xl">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">
                No articles found. {searchQuery && "Try a different search term."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.slice(0, articlesPerPage * currentPage).map((article) => (
                  <Link key={article.id} to={`/blog/${article.slug}`}>
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow group">
                      {article.featured_image_url && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={article.featured_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">{article.category}</Badge>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {article.reading_time_minutes} min read
                          </div>
                        </div>

                        <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h2>

                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {article.description}
                        </p>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(article.published_at), "MMM d, yyyy")}
                          </span>
                          <span>{article.author_name}</span>
                        </div>

                        {article.tags.length > 0 && (
                          <div className="flex gap-1 mt-3 flex-wrap">
                            {article.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Load More / Pagination */}
              {filteredArticles.length > articlesPerPage * currentPage && (
                <div className="text-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Load More Articles
                  </Button>
                </div>
              )}

              {/* Article Count */}
              <div className="text-center mt-6 text-sm text-muted-foreground">
                Showing {Math.min(articlesPerPage * currentPage, filteredArticles.length)} of {filteredArticles.length} articles
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
