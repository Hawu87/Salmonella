import Container from "@/components/Container";
import SectionNumber from "@/components/SectionNumber";
import FigureBlock from "@/components/FigureBlock";

const FIGURES = [
  {
    label: "Figure 01",
    title: "Transmission pathways",
    caption:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
  },
  {
    label: "Figure 02",
    title: "Symptom onset timeline",
    caption:
      "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  },
  {
    label: "Figure 03",
    title: "Symptom distribution",
    caption:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.",
  },
  {
    label: "Figure 04",
    title: "Risk group breakdown",
    caption:
      "Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia.",
  },
  {
    label: "Figure 05",
    title: "Source attribution",
    caption:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor.",
  },
  {
    label: "Figure 06",
    title: "Prevention overview",
    caption:
      "Ut enim ad minim veniam quis nostrud exercitation ullamco laboris.",
  },
];

export default function VisualizationsPage() {
  return (
    <div className="bg-white">
      <Container>
        <section className="mb-14 grid gap-10 lg:grid-cols-[auto_1fr] lg:gap-16">
          <SectionNumber number="03" />
          <div>
            <h1 className="text-3xl font-bold text-[#111827] lg:text-4xl">
              Visualizations
            </h1>
          </div>
        </section>

        <div className="max-w-3xl">
          {FIGURES.map((fig) => (
            <FigureBlock
              key={fig.label}
              label={fig.label}
              title={fig.title}
              caption={fig.caption}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
