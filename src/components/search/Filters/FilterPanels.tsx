import type { SearchResult } from '@/types/SearchQuery';
import Divider from '@mui/material/Divider';
import AvailabilityFilterPanel from './Panels.tsx/AvailabilityFilterPanel';
import MinFilterPanel from './Panels.tsx/MinFilterPanel';
import SemesterFilterPanel from './Panels.tsx/SemesterFilterPanel';
import SectionTypeFilterPanel from './Panels.tsx/SectionTypeFilterPanel';

type FilterPanelProps = {
  data: {
    chosenSectionTypes: string[];
    chosenSemesters: string[];
    minGPA: string;
    minRating: string;
    semesters: string[];
    semFilteredResults: SearchResult[];
    sectionTypes: string[];
    setChosenSectionTypes: React.Dispatch<React.SetStateAction<string[]>>;
    setChosenSemesters: React.Dispatch<React.SetStateAction<string[]>>;
    enabled: boolean;
    semester: string;
    availableSemesters: string[];
  };
};

export default function FilterPanels({ data }: FilterPanelProps) {
  return (
    <div className="flex flex-col">
      {[
        <AvailabilityFilterPanel key="availability" data={data} />,
        <MinFilterPanel key="min" data={data} />,
        <SemesterFilterPanel key="semester" data={data} />,
        <SectionTypeFilterPanel key="sectionType" data={data} />,
      ].flatMap((item, index) => {
        return index > 0
          ? [<Divider key={`divider-${index}`} variant="middle" />, item]
          : [item];
      })}
    </div>
  );
}
