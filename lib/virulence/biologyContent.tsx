import type { ReactNode } from "react";

export interface CuratedBiologySection {
  /** Label shown in the sidebar / vertical nav. */
  navLabel: string;
  /** Heading rendered above the section content. */
  title: string;
  /** Rendered as-is. Curated sections are JSX preserving the original copy verbatim. */
  content: ReactNode;
}

export interface CuratedBiologyEntry {
  /**
   * Canonical species keys (e.g. `salmonella_typhi`, `campylobacter_jejuni`)
   * that share this curated content. If any of these species is present in
   * the dataset the sections render once — they are not duplicated when
   * multiple keys (like jejuni + coli) point at the same entry.
   */
  speciesKeys: string[];
  sections: CuratedBiologySection[];
}

/** Copy used for any species that is not in the curated map. */
export const PLACEHOLDER_BIOLOGY_CONTENT = "[Placeholder content — to be updated]";

/**
 * Inline citation chip used inside curated content. Kept colocated with the
 * curated copy so the citation rendering stays identical to the original
 * biology page.
 */
function Cite({ id }: { id: string }) {
  const num = id.replace("ref", "");
  return (
    <a
      href={`/references#${id}`}
      className="text-primary hover:underline"
      title={`Reference ${num}`}
    >
      [{num}]
    </a>
  );
}

/**
 * The original "Overview" section, restored verbatim from the pre-refactor
 * biology page. Always rendered first, regardless of which species are in
 * the dataset.
 */
export const OVERVIEW_BIOLOGY_SECTION: CuratedBiologySection = {
  navLabel: "Overview",
  title: "Overview",
  content: (
    <>
      <p>
        This section covers the biology of two major foodborne bacterial
        pathogens: <strong>Salmonella typhi</strong> and{" "}
        <strong>Campylobacter</strong>. Both are leading causes of bacterial
        gastroenteritis worldwide and are commonly studied for their
        virulence-associated genes.
      </p>
      <p>
        While they share certain transmission pathways — particularly through
        contaminated poultry and food products — they differ significantly in
        their biology, infection mechanisms, and virulence strategies.
        Understanding these differences is central to comparative pathogen
        research.
      </p>
      <div className="mt-8 border-l-4 border-primary pl-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
          Key point
        </p>
        <p className="mt-2 text-sm text-[#111827]">
          Salmonella and Campylobacter are both major foodborne pathogens, but
          they employ distinct virulence mechanisms and affect hosts
          differently.
        </p>
      </div>
    </>
  ),
};

/**
 * The original "Risk Groups" section, restored verbatim. Always rendered
 * last.
 */
export const RISK_GROUPS_BIOLOGY_SECTION: CuratedBiologySection = {
  navLabel: "Risk Groups",
  title: "Risk Groups",
  content: (
    <>
      <p>
        Both Salmonella and Campylobacter infections can affect anyone, but
        certain populations are more vulnerable to severe outcomes. These
        include young children, older adults, and individuals with weakened
        immune systems <Cite id="ref2" /> <Cite id="ref-CAM-002" />.
      </p>
      <p>
        For Salmonella, reduced stomach acidity, underlying illness, and
        exposure to contaminated food or animals increase the risk of
        complications. Typhoidal Salmonella can cause systemic disease
        requiring antibiotic treatment <Cite id="ref2" />.
      </p>
      <p>
        For Campylobacter, children under five in endemic regions are
        disproportionately affected. Post-infectious complications such as
        Guillain-Barré syndrome — an autoimmune condition affecting the
        nervous system — are a recognized risk following Campylobacter
        infection <Cite id="ref-CAM-001" />.
      </p>
      <div className="mt-8 border-l-4 border-primary pl-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
          Key point
        </p>
        <p className="mt-2 text-sm text-[#111827]">
          Children, elderly individuals, and immunocompromised people face the
          highest risk from both pathogens. Campylobacter carries additional
          risk of post-infectious neurological complications.
        </p>
      </div>
    </>
  ),
};

/**
 * Curated per-species biology content. Each entry preserves the original
 * pre-refactor copy verbatim. The `speciesKeys` array lets a single curated
 * entry cover multiple species keys (e.g. C. jejuni and C. coli both share
 * the genus-level Campylobacter sections).
 *
 * To add curated content for a new species, append a new entry here. Any
 * species in the dataset that does not match an entry falls back to a
 * placeholder section.
 */
export const CURATED_BIOLOGY: CuratedBiologyEntry[] = [
  {
    speciesKeys: ["salmonella_typhi"],
    sections: [
      {
        navLabel: "Salmonella typhi",
        title: "What is Salmonella typhi",
        content: (
          <>
            <p>
              Salmonella is a genus of Gram-negative, rod-shaped bacteria
              responsible for salmonellosis, one of the most common foodborne
              infections worldwide <Cite id="ref1" /> <Cite id="ref2" />. The
              bacteria are typically transmitted through contaminated food or
              water and can infect both humans and animals.
            </p>
            <p>
              More than 2,500 Salmonella serotypes have been identified, with
              many infections caused by strains of Salmonella enterica{" "}
              <Cite id="ref1" />. These infections are generally categorized
              into two major groups: non-typhoidal Salmonella, which usually
              causes gastrointestinal illness, and typhoidal Salmonella, which
              causes enteric fever and more severe systemic disease{" "}
              <Cite id="ref2" />.
            </p>
            <div className="mt-8 border-l-4 border-primary pl-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Key point
              </p>
              <p className="mt-2 text-sm text-[#111827]">
                Salmonella is a diverse group of bacteria mainly spread through
                contaminated food or water, causing millions of infections
                worldwide each year <Cite id="ref1" /> <Cite id="ref2" />.
              </p>
            </div>
          </>
        ),
      },
      {
        navLabel: "Infection (S. typhi)",
        title: "Infection Process (S. typhi)",
        content: (
          <>
            <p>
              Infection typically begins when contaminated food or water is
              ingested. After entering the digestive system, Salmonella
              bacteria reach the intestinal tract where they attach to and
              invade epithelial cells lining the intestine <Cite id="ref1" />.
            </p>
            <p>
              The invasion process is mediated by specialized genetic regions
              called Salmonella pathogenicity islands. These regions encode a
              type III secretion system that allows the bacterium to inject
              proteins into host cells and trigger its own uptake{" "}
              <Cite id="ref1" />.
            </p>
            <p>
              Once inside the host cell, Salmonella can survive within a
              membrane-bound compartment called the Salmonella-containing
              vacuole, which helps protect the bacteria from immune defenses
              while it replicates <Cite id="ref1" /> <Cite id="ref2" />.
            </p>
            <p>
              Food products such as poultry remain a common source of
              contamination, and research shows antimicrobial interventions can
              significantly reduce Salmonella levels in chicken products{" "}
              <Cite id="ref3" />.
            </p>
            <div className="my-8">
              <img
                src="/infection-process.png"
                alt="Illustration of the Salmonella infection process"
                className="mx-auto w-full max-w-3xl rounded-md"
              />
              <p className="mt-3 text-xs text-[#6B7280]">
                Figure 1. Illustration of the Salmonella infection process.
                Image generated using OpenAI DALL·E.
              </p>
            </div>
            <div className="mt-8 border-l-4 border-primary pl-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Key point
              </p>
              <p className="mt-2 text-sm text-[#111827]">
                Salmonella infection begins with ingestion of contaminated
                food, followed by bacterial invasion of intestinal cells and
                intracellular survival mechanisms <Cite id="ref1" />.
              </p>
            </div>
          </>
        ),
      },
    ],
  },
  {
    speciesKeys: ["campylobacter_jejuni", "campylobacter_coli"],
    sections: [
      {
        navLabel: "Campylobacter",
        title: "What is Campylobacter",
        content: (
          <>
            <p>
              Campylobacter is a genus of Gram-negative, spiral-shaped bacteria
              and the leading cause of bacterial gastroenteritis worldwide.{" "}
              <em>Campylobacter jejuni</em> and <em>Campylobacter coli</em> are
              the species most commonly associated with human disease{" "}
              <Cite id="ref-CAM-001" />.
            </p>
            <p>
              Transmission occurs primarily through consumption of contaminated
              poultry, unpasteurized milk, and contaminated water. In endemic
              regions, environmental contamination and direct animal contact
              are also significant risk factors <Cite id="ref-CAM-001" />.
            </p>
            <p>
              Unlike Salmonella, Campylobacter is microaerophilic and
              thermophilic, requiring specific atmospheric conditions for
              growth. Despite being fragile outside of hosts, it remains a
              persistent public health challenge due to its prevalence in the
              poultry supply chain <Cite id="ref-CAM-002" />.
            </p>
            <div className="my-8">
              <img
                src="/images/cover-page.png"
                alt="Campylobacter transmission and environmental reservoirs"
                className="mx-auto w-full max-w-3xl rounded-md"
              />
              <p className="mt-3 text-xs text-[#6B7280]">
                Figure 2. Transmission, environmental reservoirs, and risk
                factors for human Campylobacteriosis <Cite id="ref-CAM-001" />.
              </p>
            </div>
            <div className="mt-8 border-l-4 border-secondary pl-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Key point
              </p>
              <p className="mt-2 text-sm text-[#111827]">
                Campylobacter jejuni and C. coli are the leading causes of
                bacterial gastroenteritis globally, transmitted primarily
                through contaminated poultry and water <Cite id="ref-CAM-001" />.
              </p>
            </div>
          </>
        ),
      },
      {
        navLabel: "Virulence (Campylobacter)",
        title: "Virulence Factors (Campylobacter)",
        content: (
          <>
            <p>
              Campylobacter virulence is mediated by a repertoire of genes
              involved in motility, adhesion, invasion, and toxin production.
              Key virulence factors include:
            </p>
            <ul className="mt-4 list-inside list-disc space-y-2 text-[#111827]">
              <li>
                <strong>flaA</strong> — Flagellar protein essential for
                motility and colonization of the intestinal tract.
              </li>
              <li>
                <strong>cadF</strong> — Fibronectin-binding protein that
                mediates adhesion to host epithelial cells.
              </li>
              <li>
                <strong>ciaB</strong> — Invasion-associated protein required
                for host cell internalization.
              </li>
              <li>
                <strong>cdtA/B/C</strong> — Cytolethal distending toxin
                subunits that cause DNA damage in host cells.
              </li>
            </ul>
            <p className="mt-4">
              The distribution of these genes varies across species and host
              environments, making comparative analysis essential for
              understanding pathogenicity patterns <Cite id="ref-CAM-003" />.
            </p>
            <div className="mt-8 border-l-4 border-secondary pl-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                Key point
              </p>
              <p className="mt-2 text-sm text-[#111827]">
                Campylobacter virulence depends on a set of genes for motility,
                adhesion, invasion, and toxin activity, whose distribution
                varies across species and hosts <Cite id="ref-CAM-003" />.
              </p>
            </div>
          </>
        ),
      },
    ],
  },
];

/**
 * Look up the curated entry for a given species key, if any. Returns
 * `undefined` for species without curated content (which should fall back
 * to placeholder rendering).
 */
export function findCuratedEntryForSpecies(
  speciesKey: string,
): CuratedBiologyEntry | undefined {
  return CURATED_BIOLOGY.find(entry => entry.speciesKeys.includes(speciesKey));
}
