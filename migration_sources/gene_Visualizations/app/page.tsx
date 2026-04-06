'use client';

import { useState, useEffect } from "react";
import Section from "@/components/Section";
import { visuals } from "./data/visuals";
import { DataProvider } from "@/components/DataProvider";
import StoryCard from "@/components/StoryCard";
import BarChart from "@/components/BarChart";
import Matrix from "@/components/Matrix";
import GeneFunctionSunburst from "@/components/visualizations/GeneFunctionSunburst";
import CooccurrenceNetwork from "@/components/visualizations/CooccurrenceNetwork";
import SpeciesBarChart from "@/components/visualizations/SpeciesBarChart";
import FunctionPie from "@/components/visualizations/FunctionPie";
import Sunburst from "@/components/visualizations/Sunburst";
import Sankey from "@/components/visualizations/Sankey";

import ReferencesSection from "@/components/ReferencesSection";
import Citation from "@/components/Citation";
import VizSourceFooter from "@/components/VizSourceFooter";

export default function Home() {
  const [topN, setTopN] = useState(20);
  const [showPercent, setShowPercent] = useState(false);

  // Handle hash links when navigating from other pages
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  return (
    <>
      {/* HERO SECTION */}
      <section id="hero" className="text-center pt-12 sm:pt-16 lg:pt-20 pb-20 md:pb-40 bg-gray-50 dark:bg-gray-900 scroll-mt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 md:mb-6 text-gray-900 dark:text-gray-100">
            Virulence Gene Insights.
            <br />
            <span className="text-blue-600 dark:text-blue-400">
              Visualized.
            </span>
          </h1>
          <div className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-6 md:mb-10 space-y-4">
            <p>
              Campylobacter is the leading cause of bacterial gastroenteritis worldwide, and the most common strains, <em>Campylobacter jejuni</em> and <em>Campylobacter coli</em> are commonly studied and their virulence-associated genes profiled. These genes play roles in bacterial survival, host interactions, and environmental persistence.<Citation number={1} />
            </p>
            <div className="mt-8 mb-8 flex justify-center px-4">
              <img
                src="/cover-page.png"
                alt="Campylobacter virulence gene visualization overview"
                className="w-full max-w-3xl rounded-xl shadow-lg"
                loading="lazy"
              />
            </div>
            <div className="mt-4 max-w-3xl mx-auto px-4">
              <p className="text-[9px] sm:text-[10px] text-gray-500/70 leading-snug text-center">
                Transmission, environmental reservoirs, and risk factors for human Campylobacteriosis. As a zoonotic disease, poultry is the primary reservoir for Campylobacter. In non-endemic regions, consuming raw or undercooked poultry meat and direct contact with animals are the primary risk factors. However, in endemic areas, environmental contamination, including water sources, along with poultry contact, increased meat consumption, and inadequate hygienic practices contribute to the widespread persistence of the bacterium.<a
                  href="#ref-1"
                  className="align-super text-[7px] sm:text-[8px] text-blue-400 hover:text-blue-300 ml-0.5"
                >
                  [1]
                </a>
              </p>
            </div>
            <p>
              Understanding the variations in gene expression across species and hosts is important for identifying broader patterns rather than individual biological outcomes. This dashboard focuses on visualizing those patterns in a clear and interactive way.
            </p>
            <p>
              Explore patterns in <em>Campylobacter jejuni</em> and <em>Campylobacter coli</em> through clear, data-driven storytelling.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 items-center">
            <a
              href="/visualizations"
              className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition text-sm sm:text-base w-full sm:w-auto"
            >
              Interactive Visualizations
            </a>
            <a
              href="#visuals"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm sm:text-base w-full sm:w-auto"
            >
              View Storylines
            </a>
            <a
              href="/data-explorer"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm sm:text-base w-full sm:w-auto"
            >
              Explore Dataset
            </a>
            <a
              href="#references"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm sm:text-base w-full sm:w-auto"
            >
              View References
            </a>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <Section
        id="features"
        title="What You Can Do"
        subtitle="Our platform helps you analyze and visualize virulence data intuitively."
      >
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
          {["Compare", "Analyze", "Visualize", "Discover", "Collaborate"].map(
            (f) => (
              <div
                key={f}
                className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base"
              >
                {f}
              </div>
            )
          )}
        </div>
      </Section>

      {/* VISUALS SECTION */}
      <DataProvider>
        <Section
          id="visuals"
          title="Visual Storylines"
          subtitle="Explore key questions about virulence genes through interactive data narratives."
        >
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Bar Chart */}
            <StoryCard
              title="Gene Virulence by Host Association"
              desc="Compare human vs multi-host prevalence and hover to see gene roles and prevalence gaps."
            >
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
                This chart shows the prevalence of key virulence genes across different host environments, revealing which genes are conserved across hosts versus those that are host-specific. Bars represent prevalence percentages, allowing you to quickly identify patterns of gene distribution.
              </p>
              <BarChart />
              <VizSourceFooter />
            </StoryCard>

            {/* Species Matrix */}
            <StoryCard
              title="Gene Expression of Virulence Genes Across Species and Strains"
              desc="This table shows whether selected virulence-associated genes are expressed in Campylobacter jejuni, Campylobacter coli, and Salmonella typhi, based on the project dataset. The comparison highlights species-level differences in virulence gene repertoires."
            >
              <p className="text-xs italic text-gray-500 dark:text-gray-400 mt-1 mb-4">
                Gene expression is derived from genomic annotation. Hover over gene names to view locus tag and chromosome location information.
              </p>
              <Matrix />
              <VizSourceFooter />
            </StoryCard>

            {/* Gene Profiles */}
            <StoryCard
              title="Virulence Genes Grouped by Biological Function"
              desc="This section organizes virulence-associated genes by annotated functional role. Explore the sunburst diagram to see categories and the genes within each group."
            >
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-4">
                Note: Refer to the Gene Expression table above for presence patterns across species.
              </p>
              <GeneFunctionSunburst />
              <VizSourceFooter />
            </StoryCard>

            {/* Function Pie Chart */}
            <StoryCard
              title="Gene Function Distribution"
              desc="Distribution of genes by functional category (Adhesion, Invasion, Toxin, Motility, Iron uptake, Stress response, Other). Hover to see counts and percentages."
            >
              <FunctionPie />
              <VizSourceFooter />
            </StoryCard>

            {/* Co-occurrence Network */}
            <StoryCard
              title="Gene Co-Occurrence Network"
              desc="This network visualization shows which virulence genes tend to appear together in the same bacterial isolates. Each circle (node) represents a gene. Larger circles mean the gene appears more frequently. Lines (links) connect genes that co-occur. Thicker lines mean those genes are found together more often. Genes are color-coded by function: red (toxin), blue (adhesion), green (invasion), orange (motility). Hover over nodes to see details, or click to explore specific genes."
            >
              <CooccurrenceNetwork />
              <VizSourceFooter />
            </StoryCard>

            {/* Species Bar Chart */}
            <StoryCard
              title="Comparison of Virulence Gene Presence Between Species"
              desc="This chart compares the presence of selected virulence-associated genes between Campylobacter jejuni and Campylobacter coli. Bars indicate whether a gene is present for each species among the selected top genes."
            >
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4">
                A value of 1 indicates gene presence; 0 indicates absence. When percentages are enabled, values represent prevalence.
              </p>
              <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center" suppressHydrationWarning>
                <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                  <span>Top N:</span>
                  <select
                    value={topN}
                    onChange={(e) => setTopN(Number(e.target.value))}
                    className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                  <input
                    type="checkbox"
                    checked={showPercent}
                    onChange={(e) => setShowPercent(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                  <span>Show Percentages</span>
                </label>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4">
                This view highlights genes that are shared across species versus those that appear species-specific in the dataset.
              </p>
              <SpeciesBarChart topN={topN} showPercent={showPercent} />
              <VizSourceFooter />
            </StoryCard>

            {/* Sunburst */}
            <StoryCard
              title="Hierarchical View: Species → Human Isolates → Gene Count"
              desc="This visualization shows how gene counts are distributed across human isolates, grouped by species. Non-human hosts are excluded. Segment size reflects relative gene count; color indicates species."
            >
              <Sunburst />
              <VizSourceFooter />
            </StoryCard>

            {/* Sankey Diagram */}
            <StoryCard
              title="Distribution of Virulence Genes Across Host Categories"
              desc="This visualization shows how virulence-associated genes are distributed across different host categories. Connections link host groups to genes, with thicker connections indicating a higher number of isolates containing that gene within the host."
            >
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-4">
                This view highlights which genes are most commonly associated with specific host categories in the dataset.
              </p>
              <Sankey topK={topN} />
              <VizSourceFooter />
            </StoryCard>

            {/* Hidden Tableau Visuals - commented out for now */}
            {false && visuals.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition p-10"
              >
                <div className="text-left mb-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    {v.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{v.desc}</p>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                  <iframe
                    src={v.tableauSrc}
                    title={v.title}
                    loading="lazy"
                    className="w-full border-none"
                    style={{
                      minHeight: `${v.height}px`,
                      overflow: "visible",
                    }}
                  ></iframe>
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-gray-50/90 to-transparent pointer-events-none"></div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </DataProvider>

      {/* ABOUT SECTION */}
      <Section
        id="about"
        title="About This Project"
        subtitle="Turning complex virulence gene data into simple insights."
      >
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed mb-6">
            Virulence Insights is a student-led data storytelling project that visualizes patterns in <em>Campylobacter jejuni</em> and <em>Campylobacter coli</em> virulence factors through interactive visualizations.
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base italic">
            Funding: Supported by the Grant (Grant ID: GRANT-XXXX). 
          </p>
        </div>
      </Section>

      {/* REFERENCES SECTION */}
      <ReferencesSection />

      {/* TEAM SECTION */}
      <Section id="team" title="Our Team">
        <p className="text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base px-4">
          Developed by a group of research enthusiasts exploring data-driven
          biology.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8 md:gap-10 px-4">
          {/* Member 1 */}
          <div className="flex flex-col items-center text-center">
            <img
              src="images/Headshots/Gerald.jpeg"
              alt="Team member 1"
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-full shadow-md border-2 border-gray-200"
            />
            <h4 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Gerald Shimo
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Full-Stack Developer</p>
          </div>

          {/* Member 2 */}
          <div className="flex flex-col items-center text-center">
            <img
              src="images/Headshots/Hawu.jpeg"
              alt="Team member 2"
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-full shadow-md border-2 border-gray-200"
            />
            <h4 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Hawulethu Ndlovu
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              Product Manager and Data Analyst
            </p>
          </div>

          {/* Member 3 */}
          <div className="flex flex-col items-center text-center">
            <img
              src="images/Headshots/Praise.jpeg"
              alt="Team member 3"
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-full shadow-md border-2 border-gray-200"
            />
            <h4 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Praise Fabiyi
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">BioInformatics Engineer</p>
          </div>

          {/* Member 4 */}
          <div className="flex flex-col items-center text-center">
            <img
              src="images/Headshots/raj-214x300.jpg"
              alt="Dr. Raj"
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-cover rounded-full shadow-md border-2 border-gray-200"
            />
            <h4 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Dr. Raj
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Faculty Advisor</p>
          </div>
        </div>
      </Section>
    </>
  );
}

