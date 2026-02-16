"use client";

const STEPS = [
  "What is Salmonella?",
  "How infection happens",
  "Symptoms & timing",
  "Who is at risk?",
];

interface StepperProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

export default function Stepper({ currentStep, onStepChange }: StepperProps) {
  return (
    <div
      className="flex flex-wrap gap-2 rounded-lg border border-[#E5E7EB] bg-[#F6F7F8] p-2"
      role="tablist"
      aria-label="Biology steps"
    >
      {STEPS.map((label, index) => {
        const isActive = currentStep === index;
        return (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`step-panel-${index}`}
            id={`step-tab-${index}`}
            onClick={() => onStepChange(index)}
            className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-[#0F766E]/30 bg-[#ECFDF5] text-[#0F766E]"
                : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#0F766E]/20 hover:text-[#111827]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
