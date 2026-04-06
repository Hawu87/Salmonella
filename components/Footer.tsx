export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[#E5E7EB] px-6 py-8">
      <p className="mx-auto max-w-[1100px] text-center text-sm text-[#6B7280]">
        &copy; {year} Pathogen Virulence Explorer &mdash; Salmonella &amp;
        Campylobacter Research
      </p>
    </footer>
  );
}
