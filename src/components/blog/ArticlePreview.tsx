import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DOMPurify from "dompurify";

interface ArticlePreviewProps {
  title: string;
  description: string;
  content: string;
  category: string;
  tags?: string;
  authorName?: string;
  featuredImageUrl?: string;
  createdAt?: string;
}

export function ArticlePreview({
  title,
  description,
  content,
  category,
  tags,
  authorName,
  featuredImageUrl,
  createdAt,
}: ArticlePreviewProps) {
  const tagArray = tags?.split(",").map((t) => t.trim()).filter(Boolean) || [];

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8">
        {/* Category Badge */}
        <Badge variant="secondary" className="mb-4">
          {category || "Uncategorized"}
        </Badge>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">{title || "Untitled Article"}</h1>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          {authorName && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{authorName}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {createdAt
                ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
                : "Just now"}
            </span>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-lg text-muted-foreground mb-6">{description}</p>
        )}

        {/* Featured Image */}
        {featuredImageUrl && (
          <img
            src={featuredImageUrl}
            alt={title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}

        {/* Tags */}
        {tagArray.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tagArray.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Content - Sanitized for XSS protection */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none ql-editor"
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(content || "<p>No content yet...</p>", {
              ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'pre', 'code', 'br', 'hr', 'span', 'div'],
              ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel', 'style']
            })
          }}
        />
      </Card>
    </div>
  );
}
