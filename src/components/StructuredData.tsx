import { useEffect } from "react";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface ArticleData {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  keywords?: string[];
}

interface StructuredDataProps {
  type: "BreadcrumbList" | "FAQPage" | "Article";
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FAQItem[];
  article?: ArticleData;
}

export function StructuredData({ type, breadcrumbs, faqs, article }: StructuredDataProps) {
  useEffect(() => {
    let jsonLd: object | null = null;

    if (type === "BreadcrumbList" && breadcrumbs) {
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url
        }))
      };
    }

    if (type === "FAQPage" && faqs) {
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      };
    }

    if (type === "Article" && article) {
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.headline,
        "description": article.description,
        "image": article.image,
        "datePublished": article.datePublished,
        "dateModified": article.dateModified || article.datePublished,
        "author": {
          "@type": "Person",
          "name": article.authorName
        },
        "publisher": {
          "@type": "Organization",
          "name": "LinkPeek",
          "logo": {
            "@type": "ImageObject",
            "url": "https://link-peek.org/logo.png"
          }
        },
        "keywords": article.keywords?.join(", ")
      };
    }

    if (jsonLd) {
      const scriptId = `structured-data-${type}`;
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      
      script.textContent = JSON.stringify(jsonLd);

      return () => {
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [type, breadcrumbs, faqs, article]);

  return null;
}
