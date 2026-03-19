import { Newspaper } from "lucide-react";
import type { NewsData } from "@/types/portal";
import { withBasePath } from "@/lib/base-path";
import NewBadge from "./NewBadge";

interface NewsSectionProps {
  data: NewsData;
}

export default function NewsSection({ data }: NewsSectionProps) {
  const publishedItems = data.items.filter((item) => item.isPublished);

  return (
    <section className="py-6 border-b border-border">
      <h2 className="text-xl font-bold text-primary mb-3 font-heading flex items-center gap-2">
        <span className="inline-block w-1 h-5 rounded-full bg-portal-gold" />
        News
      </h2>
      {publishedItems.length > 0 && (
        <ul className="space-y-2 pl-2">
          {publishedItems.map((item) => (
            <li key={item.id} className="flex items-start gap-2">
              <Newspaper className="w-4 h-4 text-portal-gold mt-0.5 shrink-0" />
              <span className="leading-relaxed">
                <a
                  href={withBasePath(item.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-portal-link hover:text-portal-link-hover font-normal transition-colors duration-150"
                >
                  {item.title}
                </a>
                {item.isNew && <NewBadge />}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
