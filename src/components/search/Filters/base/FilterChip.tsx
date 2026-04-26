'use client';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';
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

type FilterChipBaseProps = Omit<ChipProps, 'children' | 'onChange'> & {
  /**
   * Used for ARIA accessibility
   */
  id?: string;
  /**
   * What happens whenever you click the chip. If omitted, this prop is determined automatically based on what other props are provided.
   *
   * In order of precedence:
   * - `"popover"` Opens a popover menu. Add contents of popover as children.
   *   - Uses `children`
   * - `"delete"` Functions as an item that can be deleted.
   *   - Requires `onDelete`
   * - `"toggle"` Functions as a toggle button.
   *   - Controllable using {@linkcode FilterChipBaseProps.selected | selected} and {@linkcode FilterChipBaseProps.onChange | onChange}
   * - `"button"` Chip button
   * - `"none"` No interactivity
   */
  action?: 'toggle' | 'popover' | 'delete' | 'button' | 'none';
  /**
   * Label text of chip. Is typically the name of the filter
   */
  label?: ReactNode;
  /**
   * Value of the filter
   */
  renderValue?: ReactNode;
  /**
   * Separator between {@linkcode FilterChipBaseProps.label | label} and
   * {@linkcode FilterChipBaseProps.renderValue | renderValue} that displays
   * only if the latter is present
   */
  delimiterLabel?: ReactNode;
  /**
   * Component to be displayed as a popover when clicking on the chip.
   * If a function is passed, will pass an object of {@linkcode PopoverComponentCtx} as an argument.
   */
  children?: ReactNode | ChildrenPopoverContextFactory;
  /**
   * Normally, the minimum width of the popover component matches the chip's width. This prop disables that.
   * @default false
   */
  popoverNoMinWidth?: boolean;
  /**
   * Indicates that the filter has been modified
   * @default false
   */
  dirty?: boolean;
  /**
   * Shows asterisk when {@linkcode FilterChipBaseProps.dirty | dirty} is true
   * @default false
   */
  dirtyAsterisk?: boolean;
};

type FilterChipNoAction = FilterChipBaseProps & {
  action?: undefined | 'none';
};

type FilterChipPopoverAction = FilterChipBaseProps & {
  action: 'popover';
  /**
   * Component to be displayed as a popover when clicking on the chip. Or, a factory function that returns a component (with popover context passed as first parameter)
   */
  children: ReactNode | ((ctx: PopoverComponentCtx) => ReactNode);
};

type FilterChipDeleteAction = FilterChipBaseProps & {
  action: 'delete';
  onDelete: NonNullable<FilterChipBaseProps['onDelete']>;
};

type FilterChipToggleAction = FilterChipBaseProps & {
  action: 'toggle';
  selected?: boolean;
  onChange?: (
    event: React.FormEvent<HTMLDivElement>,
    selected: boolean,
  ) => void;
};

type FilterChipButtonAction = FilterChipBaseProps & {
  action: 'button';
};

export type FilterChipProps =
  | FilterChipNoAction
  | FilterChipPopoverAction
  | FilterChipDeleteAction
  | FilterChipToggleAction
  | FilterChipButtonAction;

type FilterChipRestrictedProps = Omit<FilterChipProps, 'onChange' | 'selected'>;

export default function FilterChip(props: FilterChipProps) {
  const selectedProp = props.action === 'toggle' ? props.selected : undefined;
  const onChangeToggle = props.action === 'toggle' ? props.onChange : undefined;

  const {
    id,
    className,
    action: actionProp,
    label,
    renderValue,
    delimiterLabel = ': ',
    children,
    popoverNoMinWidth,
    onClick,
    onDelete,
    dirty,
    dirtyAsterisk,
    ...rest
  } = props as FilterChipRestrictedProps;

  const action: NonNullable<typeof actionProp> =
    actionProp ??
    (children !== undefined
      ? 'popover'
      : onDelete !== undefined
        ? 'delete'
        : selectedProp !== undefined
          ? 'toggle'
          : onClick !== undefined
            ? 'button'
            : 'none');

  const [selectedUncontrolled, setSelectedUncontrolled] =
    useState<boolean>(false);
  const selected =
    selectedProp !== undefined ? selectedProp : selectedUncontrolled;

  const chipRef = useRef<HTMLDivElement>(null);
  const [popoverWidth, setPopoverWidth] = useState(0);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const openPopover = Boolean(popoverAnchorEl);

  // Matches width of popover to chip
  useEffect(() => {
    if (!chipRef.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setPopoverWidth(entry.contentRect.width),
    );
    observer.observe(chipRef.current);
    return () => observer.disconnect();
  }, []);

  const handleOpenPopover = (e: React.MouseEvent<HTMLDivElement>) => {
    setPopoverAnchorEl(e.currentTarget);
  };

  const handleClosePopover = () => {
    setPopoverAnchorEl(null);
  };

  const handleDelete = (e: React.MouseEvent<HTMLDivElement>) => {
    onDelete?.(e);
  };

  const handleToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedProp === undefined) {
      setSelectedUncontrolled((prev) => !prev);
    }
    onChangeToggle?.(e, !selected);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (action === 'popover') handleOpenPopover(e);
    if (action === 'delete') handleDelete(e);
    if (action === 'toggle') handleToggle(e);
    onClick?.(e);
  };
  const hasClickHandler = action !== 'none' || Boolean(onClick);

  const ctx: PopoverComponentCtx = {
    open: openPopover,
    closePopover: handleClosePopover,
    popoverWidth,
  };

  const childrenFactory = () => {
    if (typeof children === 'function') {
      // Is factory component, with context
      return children(ctx);
    }
    // Is regular component
    return children;
  };

  return (
    <>
      <div ref={chipRef} className="w-fit">
        <Chip
          variant="filled"
          label={
            <span className="flex justify-center gap-3">
              <span>
                {selected && <CheckIcon fontSize="small" className="mr-1.5" />}
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
              {action === 'popover' ? (
                <ArrowDropDownIcon
                  fontSize="small"
                  className="-ml-1.5 mr-1.25 fill-[rgba(var(--mui-palette-text-primaryChannel)/0.26)] group-hover/chip:fill-[rgba(var(--mui-palette-text-primaryChannel)/0.4)]"
                />
              ) : action === 'delete' ? (
                <ClearIcon
                  fontSize="small"
                  className="-ml-1.5 mr-1.25 fill-[rgba(var(--mui-palette-text-primaryChannel)/0.26)] group-hover/chip:fill-[rgba(var(--mui-palette-text-primaryChannel)/0.4)]"
                />
              ) : undefined}
            </span>
          }
          className={`group/chip ${dirty ? `bg-cornflower-100 dark:bg-cornflower-900 ${hasClickHandler ? 'hover:bg-cornflower-200 dark:hover:bg-cornflower-800' : ''}` : ''} ${className}`}
          onClick={hasClickHandler ? handleClick : undefined}
          onMouseDown={
            action === 'popover' && hasClickHandler ? handleClick : undefined
          }
          slotProps={{
            label: {
              className: `${action === 'popover' || action === 'delete' ? 'pr-0' : ''}`,
            },
          }}
          role={action !== 'none' ? 'button' : undefined}
          aria-label={`${
            action
              ? {
                  button: 'trigger',
                  delete: 'delete',
                  none: '',
                  popover: 'open',
                  toggle: 'toggle',
                }[action]
              : ''
          } ${id}`}
          aria-haspopup={action === 'popover' ? 'true' : 'false'}
          aria-expanded={action === 'popover' ? openPopover : undefined}
          aria-owns={
            action === 'popover' && openPopover ? `${id}-popover` : undefined
          }
          {...rest}
        />
      </div>
      <Popover
        id={`${id}-popover`}
        role="menu"
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
        {childrenFactory()}
      </Popover>
    </>
  );
}
