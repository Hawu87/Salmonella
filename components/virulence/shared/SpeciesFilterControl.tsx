'use client';

import { useVirulenceData } from '@/components/virulence/shared/VirulenceDataProvider';
import { SPECIES_OPTIONS, type SpeciesFilter } from '@/lib/virulence/filterData';

export default function SpeciesFilterControl() {
  const { selectedSpecies, setSelectedSpecies } = useVirulenceData();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label
            htmlFor="species-filter"
            className="block text-sm font-semibold text-gray-900"
          >
            Filter by species
          </label>
          <p className="mt-0.5 text-xs text-gray-500">
            View all species together or isolate one species across all visualizations.
          </p>
        </div>

        <div
          id="species-filter"
          role="radiogroup"
          aria-label="Filter visualizations by species"
          className="flex flex-wrap gap-1.5 rounded-lg border border-gray-200 bg-gray-50 p-1"
        >
          {SPECIES_OPTIONS.map(opt => {
            const active = selectedSpecies === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelectedSpecies(opt.value as SpeciesFilter)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 sm:text-sm ${
                  active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900'
                }`}
              >
                {opt.short}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
