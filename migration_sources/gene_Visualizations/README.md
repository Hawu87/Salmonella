This is a [Next.js](https://nextjs.org) project for visualizing Campylobacter virulence gene data.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. Install dependencies:

```bash
npm install
```

2. Ensure the Excel file is placed at:
   - `/public/data/campylobacter (1).xlsx`

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Available Routes

- `/` - Main dashboard with storylines
- `/visualizations` - Interactive data visualizations (6 different charts)

## Features

### Interactive Visualizations

The application provides 6 interactive visualizations:

1. **Heatmap**: Gene prevalence across host associations
2. **Co-Occurrence Network**: Network graph showing gene co-occurrence patterns
3. **Species Bar Chart**: Comparison of gene counts between C. jejuni and C. coli
4. **Function Pie Chart**: Distribution of genes by functional category
5. **Sunburst Diagram**: Hierarchical view of human isolates (Human isolates → Species → Gene Count)
6. **Sankey Diagram**: Flow diagram from Host categories to top genes

### API Endpoint

- `GET /api/data` - Returns processed JSON data from the Excel file including:
  - `genes`: Array of gene data with names, functions, species, hosts
  - `hostStats`: Gene counts and prevalence by host
  - `hostTotals`: Total isolates per host
  - `hostPrevalence`: Prevalence percentages by host and gene
  - `speciesMatrix`: Presence/absence matrix for C. jejuni, C. coli, and Salmonella typhi (parsed from **Sheet1** of the workbook; species cells map long-form names such as `Campylobacter jejuni (NCTC …)` / `Salmonella typhi`)
  - `cooccurrence`: Nodes and links for network visualization
  - `sunburstHierarchy`: Hierarchy data for sunburst diagram
  - `sankeyData`: Nodes and links for Sankey diagram

## Technologies Used

- Next.js 16 (App Router)
- React 19
- TypeScript
- Chart.js & react-chartjs-2 (for bar charts and pie charts)
- Plotly.js & react-plotly.js (for heatmap, sunburst, Sankey)
- react-force-graph (for network visualization)
- xlsx (for Excel file parsing)
- Tailwind CSS (for styling)

## Project Structure

```
my-app/
├── app/
│   ├── api/
│   │   └── data/
│   │       └── route.ts          # API endpoint for data processing
│   ├── visualizations/
│   │   └── page.tsx              # Visualizations page
│   └── page.tsx                  # Main dashboard page
├── components/
│   ├── visualizations/
│   │   ├── Heatmap.tsx
│   │   ├── CooccurrenceNetwork.tsx
│   │   ├── SpeciesBarChart.tsx
│   │   ├── FunctionPie.tsx
│   │   ├── Sunburst.tsx
│   │   ├── Sankey.tsx
│   │   └── ControlPanel.tsx
│   └── DataProvider.tsx          # Data context provider
└── public/
    └── data/
        └── campylobacter (1).xlsx    # Source Excel file
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# gene_Visualizations
