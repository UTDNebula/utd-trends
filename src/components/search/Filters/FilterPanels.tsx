import type { SearchResult } from '@/types/SearchQuery';
import Divider from '@mui/material/Divider';
import AvailabilityFilterPanel from './Panels/AvailabilityFilterPanel';
import MinFilterPanel from './Panels/MinFilterPanel';
import SectionTypeFilterPanel from './Panels/SectionTypeFilterPanel';
import SemesterFilterPanel from './Panels/SemesterFilterPanel';

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
