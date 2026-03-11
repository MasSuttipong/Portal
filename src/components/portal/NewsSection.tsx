import type { NewsData } from "@/types/portal";
import NewBadge from "./NewBadge";

interface NewsSectionProps {
  data: NewsData;
}

export default function NewsSection({ data }: NewsSectionProps) {
  const publishedItems = data.items.filter((item) => item.isPublished);

  return (
    <section className="py-6 border-b border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-3">News</h2>
      {publishedItems.length > 0 && (
        <ul className="list-disc list-inside space-y-2 pl-2">
          {publishedItems.map((item) => (
            <li key={item.id} className="leading-relaxed">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {item.title}
              </a>
              {item.isNew && <NewBadge />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
