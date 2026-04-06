export interface TeamMember {
  name: string;
  role: string;
  image: string;
}

export interface PathogenReference {
  id: string;
  title: string;
  source: string;
  link: string;
  description: string;
  notes: string[];
  organism?: 'salmonella' | 'campylobacter' | 'shared';
}

export interface PathogenConfig {
  key: string;
  label: string;
  scientificName: string;
  slug: string;
  accent: string;
  introSummary: string;
  biologySections: {
    title: string;
    content: string;
  }[];
}

export const SITE_TITLE = 'Pathogen Virulence Explorer';
export const SITE_DESCRIPTION =
  'A comparative research platform for exploring virulence biology, gene expression, and host associations across Salmonella and Campylobacter.';

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Gerald Shimo',
    role: 'Full-Stack Developer',
    image: '/images/team/Gerald.jpeg',
  },
  {
    name: 'Hawulethu Ndlovu',
    role: 'Product Manager & Data Analyst',
    image: '/images/team/Hawu.jpeg',
  },
  {
    name: 'Praise Fabiyi',
    role: 'Bioinformatics Engineer',
    image: '/images/team/Praise.jpeg',
  },
  {
    name: 'Dr. Raj',
    role: 'Faculty Advisor',
    image: '/images/team/raj-214x300.jpg',
  },
];

export const ALL_REFERENCES: PathogenReference[] = [
  {
    id: 'ref1',
    title: 'Salmonella in the environment: A review on ecology, antimicrobial resistance, seafood contaminations, and human health implications',
    source: 'Journal of Hazardous Materials Advances',
    link: 'https://www.sciencedirect.com/science/article/pii/S2772416624000081',
    description: 'Review of Salmonella ecology, antimicrobial resistance, and implications for human health and seafood safety.',
    notes: ['Covers environmental persistence and transmission pathways.', 'Discusses pathogenicity islands and invasion mechanisms.'],
    organism: 'salmonella',
  },
  {
    id: 'ref2',
    title: 'Salmonella spp. infection – a continuous threat worldwide',
    source: 'GERMS',
    link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8057844/',
    description: 'Overview of Salmonella as a global health threat, serotypes, clinical presentation, and risk groups.',
    notes: ['Distinguishes non-typhoidal and typhoidal Salmonella.', 'Describes symptoms, timeline, and vulnerable populations.'],
    organism: 'salmonella',
  },
  {
    id: 'ref3',
    title: 'Evaluation of USDA approved antimicrobials on the reduction of Salmonella and Campylobacter in ground chicken frames and their effect on meat quality',
    source: 'Poultry Science',
    link: 'https://www.sciencedirect.com/science/article/pii/S0032579119314324',
    description: 'Research on antimicrobial interventions to reduce Salmonella and Campylobacter in poultry products.',
    notes: ['Evaluates interventions in chicken processing.', 'Discusses impact on meat quality.'],
    organism: 'shared',
  },
  {
    id: 'ref-SAL-001',
    title: 'Salmonella (Symptoms & causes)',
    source: 'Mayo Clinic',
    link: 'https://www.mayoclinic.org/diseases-conditions/salmonella/symptoms-causes/syc-20355329',
    description: 'Defines typical symptoms and transmission patterns for Salmonella infection.',
    notes: ['Covers incubation period and common symptoms.', 'Describes foodborne and waterborne transmission.', 'Includes when to seek medical care.'],
    organism: 'salmonella',
  },
  {
    id: 'ref-CAM-001',
    title: 'Campylobacter jejuni/coli Infection: Is It Still a Concern?',
    source: 'Microorganisms (2024; 12:2669)',
    link: 'https://doi.org/10.3390/microorganisms12122669',
    description: 'Review of Campylobacter jejuni/coli infection epidemiology, virulence, and clinical relevance.',
    notes: ['Covers transmission and virulence factor overview.', 'Discusses clinical burden and epidemiology.'],
    organism: 'campylobacter',
  },
  {
    id: 'ref-CAM-002',
    title: 'Campylobacter jejuni and Campylobacter coli infection, determinants and antimicrobial resistance patterns among under-five children',
    source: 'PLoS One (2024; 19(7):e0304409)',
    link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11221748/',
    description: 'Study on Campylobacter infection patterns and antimicrobial resistance in pediatric populations.',
    notes: ['Examines prevalence among children under five.', 'Discusses AMR patterns in clinical isolates.'],
    organism: 'campylobacter',
  },
  {
    id: 'ref-CAM-003',
    title: 'Gene Summary Document — Compiled summary of virulence gene functions',
    source: 'Derived from NCBI resources',
    link: 'https://docs.google.com/document/d/1nGM_d6KqRyYwXWut-rQ5fjyRseuA2HIZdevH4Ug_-ig/edit?tab=t.0',
    description: 'Compiled summary of virulence gene functions used in the Campylobacter visualization dataset.',
    notes: ['Gene annotation reference for the virulence dashboard.'],
    organism: 'campylobacter',
  },
  {
    id: 'ref-CAM-004',
    title: 'Investigating the Significance of Non-jejuni/coli Campylobacter Strains in Patients with Diarrhea',
    source: 'Healthcare (2023; 11(18):2562)',
    link: 'https://www.mdpi.com/2227-9032/11/18/2562',
    description: 'Study on the clinical significance of non-jejuni/coli Campylobacter species.',
    notes: ['Explores underrepresented Campylobacter species in clinical settings.'],
    organism: 'campylobacter',
  },
];

export function getReferencesByOrganism(organism: 'salmonella' | 'campylobacter' | 'shared') {
  return ALL_REFERENCES.filter(r => r.organism === organism);
}
