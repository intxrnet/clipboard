import CenterCloud from "./components/center-cloud";
import * as fs from "fs";
import * as path from "path";
import { ContentData } from "./types/content";

async function getContent(): Promise<ContentData> {
  const contentPath = path.join(
    process.cwd(),
    "src",
    "app",
    "components",
    "content.json"
  );

  try {
    const rawContent = fs.readFileSync(contentPath, "utf-8");
    return JSON.parse(rawContent) as ContentData;
  } catch (error) {
    console.error("Error reading content:", error);
    // Fallback content if file read fails
    return {
      items: [
        {
          text: "Error loading content",
          description: "Please check content.json",
        },
      ],
    };
  }
}

export default async function Home() {
  const content = await getContent();

  return (
    <div className="flex flex-col items-center justify-start">
      <div className="h-[4vh]"></div>
      <CenterCloud items={content.items} />
    </div>
  );
}
