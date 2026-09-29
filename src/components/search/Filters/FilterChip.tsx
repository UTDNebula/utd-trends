'use client';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClearIcon from '@mui/icons-material/Clear';
import Chip, { type ChipProps } from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import React, { useEffect, useRef, useState, type ReactNode } from 'react';

type PopoverComponentCtx = {
  open: boolean;
  closePopover: () => void;
  popoverWidth: number;
};

type ChildrenPopoverContextFactory = (ctx: PopoverComponentCtx) => ReactNode;

type FilterChipProps = Omit<ChipProps, 'children'> & {
  /**
   * Label text of chip. Is typically the name of the filter
   */
  label?: ReactNode;
  /**
   * Value of the filter
   */
  renderValue?: ReactNode;
  /**
   * Separator between {@linkcode FilterChipProps.label | label} and
   * {@linkcode FilterChipProps.renderValue | renderValue} that displays
   * only if the latter is present
   */
  delimiterLabel?: ReactNode;
  /**
   * Component to be displayed as a popover when clicking on the chip.
   * If a function is passed, will pass an object of {@linkcode PopoverComponentCtx} as an argument.
   *
   * NOTE: If provided, will forcibly enable the {@linkcode FilterChipProps.disableDelete | disableDelete} prop.
   */
  children?: ReactNode | ChildrenPopoverContextFactory;
  /**
   * Normally, the minimum width of the popover component matches the chip's width. This prop disables that.
   * @default false
   */
  popoverNoMinWidth?: boolean;
  /**
   * Prevents the filter chip from being used to delete the filter
   * @default false
   */
  disableDelete?: boolean;
  /**
   * Indicates that the filter has been modified
   * @default false
   */
  dirty?: boolean;
  /**
   * Shows asterisk when {@linkcode FilterChipProps.dirty | dirty} is true
   * @default false
   */
  dirtyAsterisk?: boolean;
};

export default function FilterChip({
  className,
  label,
  renderValue,
  delimiterLabel = ': ',
  children,
  popoverNoMinWidth,
  disableDelete,
  onDelete,
  dirty,
  dirtyAsterisk,
  ...props
}: FilterChipProps) {
  const chipRef = useRef<HTMLDivElement>(null);
  const [popoverWidth, setPopoverWidth] = useState(0);

  // Matches width of popover to chip
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setPopoverWidth(entries[0].contentRect.width);
    });

    if (chipRef.current) {
      observer.observe(chipRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const openPopover = Boolean(popoverAnchorEl);

  const handleOpenPopover = (e: React.MouseEvent<HTMLDivElement>) => {
    setPopoverAnchorEl(e.currentTarget);
  };

  const handleClosePopover = () => {
    setPopoverAnchorEl(null);
  };

  const handleDelete = (e: React.MouseEvent<HTMLDivElement>) => {
    onDelete?.(e);
  };

  const ctx: PopoverComponentCtx = {
    open: openPopover,
    closePopover: handleClosePopover,
    popoverWidth,
  };

  const popoverComponentFactory = () => {
    if (typeof children === 'function') {
      // Is factory component, with context
      return children(ctx);
    }
    // Is regular component
    return children;
  };

  return (
    <>
      <span ref={chipRef}>
        <Chip
          variant="filled"
          label={
            <span className="flex justify-center gap-3">
              <span>
                {label}
                {dirty && dirtyAsterisk && (
                  <span className="text-cornflower-600 dark:text-cornflower-400 font-bold">
                    *
                  </span>
                )}
                {renderValue && (
                  <span className="inline-flex whitespace-pre">
                    {delimiterLabel}
                    <span
                      className={`inline-flex font-bold ${dirty ? 'text-cornflower-600 dark:text-cornflower-400' : ''}`}
                    >
                      {renderValue}
                    </span>
                  </span>
                )}
              </span>
              {children ? (
                <ArrowDropDownIcon
                  fontSize="small"
                  className="-ml-1.5 mr-1.25 fill-[rgba(var(--mui-palette-text-primaryChannel)/0.26)] group-hover/chip:fill-[rgba(var(--mui-palette-text-primaryChannel)/0.4)]"
                />
              ) : disableDelete ? undefined : (
                <ClearIcon
                  fontSize="small"
                  className="-ml-1.5 mr-1.25 fill-[rgba(var(--mui-palette-text-primaryChannel)/0.26)] group-hover/chip:fill-[rgba(var(--mui-palette-text-primaryChannel)/0.4)]"
                />
              )}
            </span>
          }
          className={`group/chip ${dirty ? 'bg-cornflower-100 hover:bg-cornflower-200 dark:bg-cornflower-900 dark:hover:bg-cornflower-800' : ''} ${className}`}
          onClick={
            children
              ? handleOpenPopover
              : disableDelete
                ? undefined
                : handleDelete
          }
          slotProps={{
            label: {
              className: `${children || !disableDelete ? 'pr-0' : ''}`,
            },
          }}
          aria-haspopup="menu"
          aria-expanded={openPopover}
          {...props}
        />
      </span>
      <Popover
        open={openPopover}
        onClose={handleClosePopover}
        anchorEl={popoverAnchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        slotProps={{
          paper: {
            className: 'rounded-lg',
            style: {
              minWidth: popoverNoMinWidth ? undefined : `${popoverWidth}px`,
            },
          },
        }}
      >
        {popoverComponentFactory()}
      </Popover>
    </>
  );
}
