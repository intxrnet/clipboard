import CenterCloud from "./components/center-cloud";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen">
      <div className="h-[4vh]"></div>
      <CenterCloud
        items={[
          {
            text: "to txt",
            description: "save snippet as plain text",
          },
          {
            text: "to img",
            description: "capture clipboard into an image",
          },
        ]}
      ></CenterCloud>
    </div>
  );
}
