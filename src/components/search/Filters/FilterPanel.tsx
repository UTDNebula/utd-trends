import { ChevronRight } from '@mui/icons-material';
import { Collapse, IconButton, Typography } from '@mui/material';
import React, { useState, type ReactNode } from 'react';

interface FilterPanelPropsBase {
  heading?: ReactNode;
  description?: ReactNode;
  startAdornment?: React.JSX.Element;
  endAdornment?: React.JSX.Element;
}

export interface FilterPanelProps extends FilterPanelPropsBase {
  className?: string;
  slotClassNames?: {
    heading?: string;
    collapse?: string;
    collapseButton?: string;
    description?: string;
  };
  style?: React.CSSProperties;
  id?: string;
  children?: ReactNode;
}

export default function FilterPanel({
  children,
  heading,
  description,
  startAdornment,
  endAdornment,
  className,
  slotClassNames,
  style,
  id,
}: FilterPanelProps) {
  const hasHeading = Boolean(startAdornment || heading || endAdornment);

  const [collapsed, setCollapsed] = useState(false);

  const CollapseButton = (
    <IconButton
      onClick={(e) => {
        e.stopPropagation();
        setCollapsed((prev) => !prev);
      }}
      className={slotClassNames?.collapseButton}
    >
      <ChevronRight
        className={`transition-transform ${collapsed ? 'rotate-0' : 'rotate-90'}`}
      />
    </IconButton>
  );

  return (
    <div
      className={`flex flex-col p-5 min-w-0 max-w-6xl
        target:outline-2 outline-royal dark:outline-cornflower-300 ${className ?? ''}`}
      {...(id ? { id } : {})}
      style={style}
    >
      {hasHeading && (
        <div
          className={`flex justify-between cursor-pointer select-none ${slotClassNames?.heading}`}
          onClick={() => {
            setCollapsed((prev) => !prev);
          }}
        >
          <div className="flex">
            <div className={`flex items-center gap-2 min-h-10`}>
              {startAdornment}
              {heading && (
                <Typography variant="h2" className="text-xl font-bold">
                  {heading}
                </Typography>
              )}
              {endAdornment}
            </div>
          </div>
          {CollapseButton}
        </div>
      )}
      <Collapse in={!collapsed} className={slotClassNames?.collapse}>
        <div className={`flex flex-col gap-2 ${hasHeading ? 'pt-2' : ''}`}>
          {description && (
            <div
              className={`mb-4 text-slate-600 dark:text-slate-400 text-sm ${slotClassNames?.description}`}
            >
              {description}
            </div>
          )}
          {children}
        </div>
      </Collapse>
    </div>
  );
}
