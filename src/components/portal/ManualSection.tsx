import type { ManualData } from "@/types/portal";

interface ManualSectionProps {
  data: ManualData;
}

export default function ManualSection({ data }: ManualSectionProps) {
  const publishedItems = data.items.filter((item) => item.isPublished);

  return (
    <section className="py-6 border-b border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-3">Manual</h2>
      {data.subHeading && (
        <p className="text-gray-700 mb-3 leading-relaxed">{data.subHeading}</p>
      )}
      {publishedItems.length > 0 && (
        <ul className="list-disc list-inside space-y-2 pl-2">
          {publishedItems.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline leading-relaxed"
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
