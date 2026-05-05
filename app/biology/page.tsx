import BiologyView, { type BiologyEntry } from "./BiologyView";
import { getDatasetSpeciesKeys } from "@/lib/virulence/serverData";
import { getSpeciesMeta } from "@/lib/virulence/species";
import {
  CURATED_BIOLOGY,
  OVERVIEW_BIOLOGY_SECTION,
  PLACEHOLDER_BIOLOGY_CONTENT,
  RISK_GROUPS_BIOLOGY_SECTION,
} from "@/lib/virulence/biologyContent";

function toEntry(section: {
  navLabel: string;
  title: string;
  content: BiologyEntry["content"];
}): BiologyEntry {
  return {
    navLabel: section.navLabel,
    title: section.title,
    content: section.content,
  };
}

export default function BiologyPage() {
  const speciesKeys = getDatasetSpeciesKeys();

  /**
   * Build the per-species sections.
   *
   *   - Curated species → emit the curated sections exactly once. If two
   *     species keys map to the same curated entry (e.g. C. jejuni and
   *     C. coli both share the genus-level Campylobacter content), the
   *     sections are not duplicated.
   *   - Uncurated species → emit a single placeholder section using the
   *     species' display label as the heading and sidebar title.
   */
  const renderedCuratedIndices = new Set<number>();
  const speciesEntries: BiologyEntry[] = [];

  for (const speciesKey of speciesKeys) {
    const curatedIdx = CURATED_BIOLOGY.findIndex(e =>
      e.speciesKeys.includes(speciesKey),
    );

    if (curatedIdx >= 0) {
      if (renderedCuratedIndices.has(curatedIdx)) continue;
      renderedCuratedIndices.add(curatedIdx);
      const entry = CURATED_BIOLOGY[curatedIdx];
      entry.sections.forEach(section => speciesEntries.push(toEntry(section)));
    } else {
      const meta = getSpeciesMeta(speciesKey);
      speciesEntries.push({
        navLabel: meta.shortLabel,
        title: meta.fullLabel,
        content: PLACEHOLDER_BIOLOGY_CONTENT,
        accent: meta.accent,
      });
    }
  }

  const entries: BiologyEntry[] = [
    toEntry(OVERVIEW_BIOLOGY_SECTION),
    ...speciesEntries,
    toEntry(RISK_GROUPS_BIOLOGY_SECTION),
  ];

  return <BiologyView entries={entries} />;
}
