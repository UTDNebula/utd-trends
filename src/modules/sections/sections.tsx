export default function sectionCanOverlap(section: string): boolean {
  return /^[12367]/.test(section);
}
