"use client";

import Card from "@/components/Card";
import Chip from "@/components/Chip";

const MAYO_PARAGRAPH_1 =
  "Salmonella infection (salmonellosis) is a common bacterial disease that affects the intestinal tract. Salmonella bacteria typically live in animal and human intestines and are shed through stool (feces). Humans become infected most frequently through contaminated water or food.";

const MAYO_PARAGRAPH_2 =
  "Some people with salmonella infection have no symptoms. Most people develop diarrhea, fever and stomach (abdominal) cramps within 8 to 72 hours after exposure. Most healthy people recover within a few days to a week without specific treatment.";

const STEP_CONTENT = [
  {
    title: "What is Salmonella?",
    paragraphs: [MAYO_PARAGRAPH_1, MAYO_PARAGRAPH_2],
    keyPoint:
      "Salmonellosis is a bacterial infection of the gut, usually spread by contaminated food or water.",
    cite: ["ref-SAL-001"],
  },
  {
    title: "How infection happens",
    paragraphs: [
      "Infection occurs when Salmonella bacteria enter the body through the mouth—most often via undercooked or raw animal products, contaminated produce, or untreated water. The bacteria survive stomach acid and reach the intestines, where they multiply and can cause inflammation.",
      "Person-to-person spread is possible when an infected person does not wash hands after using the bathroom, then handles food or touches surfaces. Outbreaks are often linked to a single contaminated source.",
    ],
    keyPoint:
      "Most infections are foodborne; proper cooking and hand hygiene reduce transmission.",
    cite: ["ref-SAL-001", "ref-SAL-002"],
  },
  {
    title: "Symptoms & timing",
    paragraphs: [
      "Symptoms typically begin 8 to 72 hours after exposure. The most common are diarrhea (sometimes bloody), fever, and abdominal cramps. Nausea, vomiting, and headache can also occur. Illness usually lasts 4 to 7 days.",
      "Some people carry the bacteria without symptoms and can still shed it, which is why handwashing and food safety matter even when no one appears sick.",
    ],
    keyPoint:
      "Incubation is 8–72 hours; diarrhea, fever, and cramps are the hallmark symptoms.",
    cite: ["ref-SAL-001"],
  },
  {
    title: "Who is at risk?",
    paragraphs: [
      "Anyone can get salmonellosis, but young children, older adults, pregnant people, and those with weakened immune systems are more likely to have severe illness or complications. In these groups, infection can spread beyond the gut and require medical care.",
      "People who handle raw food, work with animals, or travel to areas with limited safe water and food may have higher exposure. Prevention focuses on food safety and hygiene for everyone, with extra care for high-risk groups.",
    ],
    keyPoint:
      "High-risk groups include the very young, elderly, immunocompromised, and pregnant individuals.",
    cite: ["ref-SAL-001", "ref-SAL-003"],
  },
];

interface StepContentProps {
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
}

export default function StepContent({
  currentStep,
  onBack,
  onNext,
}: StepContentProps) {
  const step = STEP_CONTENT[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEP_CONTENT.length - 1;

  return (
    <Card>
      <div
        id={`step-panel-${currentStep}`}
        role="tabpanel"
        aria-labelledby={`step-tab-${currentStep}`}
      >
        <h2 className="font-serif text-2xl font-bold text-[#111827]">
          {step.title}
        </h2>
        <div className="mt-6 space-y-4 text-[#111827]">
          {step.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="mt-6 border-l-4 border-[#0F766E] bg-[#ECFDF5] px-4 py-3">
          <p className="text-sm font-semibold text-[#0F766E]">Key point</p>
          <p className="mt-1 text-sm text-[#111827]">{step.keyPoint}</p>
        </div>
        <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#6B7280]">
          <span>Cite:</span>
          {step.cite.map((ref) => (
            <Chip key={ref} href={`/references#${ref}`}>
              {ref}
            </Chip>
          ))}
        </p>
      </div>
      <div className="mt-8 flex gap-4 border-t border-[#E5E7EB] pt-6">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst}
          className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:border-[#0F766E] hover:text-[#0F766E]"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={isLast}
          className="rounded-lg bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#0D5F58]"
        >
          Next
        </button>
      </div>
    </Card>
  );
}
