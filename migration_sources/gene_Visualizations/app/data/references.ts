export interface ReferenceItem {
  id: string;
  number: number;
  fullCitation: string;
  doiUrl?: string;
  url?: string;
}

export const references: ReferenceItem[] = [
  {
    id: 'ref-1',
    number: 1,
    fullCitation:
      'Veronese, P.; Dodi, I. Campylobacter jejuni/coli Infection: Is It Still a Concern? Microorganisms. 2024; 12:2669.',
    doiUrl: 'https://doi.org/10.3390/microorganisms12122669',
  },
  {
    id: 'ref-002',
    number: 2,
    fullCitation:
      'Worku, M.; Tessema, B.; Ferede, G.; et al. Campylobacter jejuni and Campylobacter coli infection, determinants and antimicrobial resistance patterns among under-five children with diarrhea in Amhara National Regional State, Northwest Ethiopia. PLoS One. 2024; 19(7):e0304409.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11221748/',
  },
  {
    id: 'ref-003',
    number: 3,
    fullCitation:
      'Gene Summary Document. Compiled summary of virulence gene functions. Derived from NCBI resources.',
    url: 'https://docs.google.com/document/d/1nGM_d6KqRyYwXWut-rQ5fjyRseuA2HIZdevH4Ug_-ig/edit?tab=t.0',
  },
  {
    id: 'ref-004',
    number: 4,
    fullCitation:
      'Teksoy, N.; Ilktac, M.; Ongen, B. Investigating the Significance of Non-jejuni/coli Campylobacter Strains in Patients with Diarrhea. Healthcare. 2023; 11(18):2562.',
    url: 'https://www.mdpi.com/2227-9032/11/18/2562',
  },
];

export function getReferenceById(id: string): ReferenceItem | undefined {
  return references.find((r) => r.id === id);
}

export function getReferenceByNumber(n: number): ReferenceItem | undefined {
  return references.find((r) => r.number === n);
}
