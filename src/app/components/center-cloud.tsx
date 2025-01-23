import Link from "next/link";

interface CloudItem {
  text: string;
  description?: string;
}

interface CenterCloudProps {
  items: CloudItem[];
}

export default function CenterCloud({ items }: CenterCloudProps) {
  const title = "www";
  const titleLink = `https://${title}.intxr.net`;

  const formatHref = (text: string): string => {
    return `/${text.toLowerCase().replace(/\s+/g, "-")}`;
  };

  return (
    <div className="relative border border-gray-300 p-4 rounded-lg w-1/4">
      <Link
        href={titleLink}
        className="absolute -top-3 center-2 bg-white px-2 text-sm hover:underline"
      >
        {title}
      </Link>
      <ul className="space-y-2 text-center">
        {items.map((item, index) => (
          <li key={index} className="relative">
            <Link
              href={formatHref(item.text)}
              className="hover:underline group"
            >
              {item.text}
              {item.description && (
                <div className="hidden group-hover:block absolute left-1/2 transform -translate-x-1/2 mt-2 p-2 bg-white border border-gray-200 rounded shadow-lg min-w-max z-10">
                  {item.description}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
