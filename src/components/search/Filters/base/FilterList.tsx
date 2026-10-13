import BlockIcon from '@mui/icons-material/Block';
import { Divider, IconButton, ListItem, Tooltip } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Radio from '@mui/material/Radio';
import { useState, type ReactNode } from 'react';

type FilterListItemBase<Value = string> = {
  label?: string;
  value: NonNullable<Value>;
  /**
   * Specifies what to render this item as
   * - "item" - Renders as a regular list item
   * - "divider" - Renders a divider
   * @default "item"
   */
  type?: 'item' | 'divider';
  /**
   * Overrides whether this item is visually selected. Also provides additional checkbox controls.
   */
  checkboxOverride?: {
    checked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
  };
  /**
   * Disables exclusion for this item
   */
  disableExclusion?: boolean;
  /**
   * Modifies the secondary action of the item
   */
  secondaryAction?: {
    /**
     * Whether this alternate secondary action is visible
     */
    visible?: boolean;
    /**
     * Action performed when clicking the secondary action button
     *
     * NOTE: By default, exclusion is still enabled and will run before this event handler function.
     * To disable exclusion for this item, set {@linkcode FilterListItem.disableExclusion | disableExclusion} to true.
     */
    onClick?: () => void;
    /**
     * Changes the icon used for the secondary action
     * NOTE: Set the `fontSize` prop to "small" for MUI icons
     * @default <BlockIcon fontSize="small" />
     */
    icon?: ReactNode;
    /**
     * Changes the tooltip used for the secondary action
     * @default "Exclude"
     */
    tooltip?: ReactNode;
  };
};

export type FilterListItem<Value = string> = FilterListItemBase<Value> | Value;

export type FilterListProps = {
  /**
   * Controls the type of the selection list
   * - "checkbox" - Any number of options can be selected
   * - "radio" - Only one option can be selected at a time
   * @default "checkbox"
   */
  type?: 'checkbox' | 'radio';
  /**
   * Array of list options
   */
  options: (FilterListItem | string)[];
  /**
   * Array of list values that correspond to selected options. Used to control the component
   */
  selectedValues?: FilterListItemBase['value'][];
  /**
   * Array of list values that correspond to excluded options. Used to control the component
   */
  excludedValues?: FilterListItemBase['value'][];
  /**
   * Callback function that provides the updated selectedValues and excludedValues whenever
   * the user changes their selection. Used to raise the component's state
   * @param newSelectedValues Updated array of values that correspond to selected options
   * @param newExcludedValues Updated array of values that correspond to excluded options
   */
  onChange?: (
    newSelectedValues: FilterListItemBase['value'][],
    newExcludedValues: FilterListItemBase['value'][],
  ) => void;
  /**
   * Whether to enable the exclusion buttons
   * @default false
   */
  enableExclusion?: boolean;
  /**
   * When `type` prop is "radio", this allows users to deselect their choice
   * @default false
   */
  disallowDeselecting?: boolean;
  /**
   * Removes the backdrop fill of selected items
   * @default false
   */
  disableSelectedBackdrop?: boolean;
  /**
   * Removes the backdrop gradient of excluded items
   * @default false
   */
  disableExcludedBackdrop?: boolean;
  /**
   * Render the option's content. By default, uses `option.label`, then `option.value`
   */
  renderOptionContent?: (
    props: object,
    option: FilterListItemBase,
  ) => ReactNode;
};

export default function FilterList({
  type = 'checkbox',
  options: optionsProp,
  selectedValues,
  excludedValues,
  onChange,
  enableExclusion = false,
  disallowDeselecting = false,
  disableSelectedBackdrop = false,
  disableExcludedBackdrop = false,
  renderOptionContent,
}: FilterListProps) {
  const [selectedUncontrolled, setSelected] = useState<
    FilterListItemBase['value'][]
  >(selectedValues ?? []);
  const [excludedUncontrolled, setExcluded] = useState<
    FilterListItemBase['value'][]
  >(excludedValues ?? []);

  const selected = selectedValues ?? selectedUncontrolled;
  const excluded = excludedValues ?? excludedUncontrolled;

  const handleToggle = (item: FilterListItemBase) => {
    let newSelected = [...selected];
    let newExcluded = [...excluded];
    switch (type) {
      case 'checkbox':
        const currentIndex = selected.indexOf(item.value);
        if (currentIndex === -1) {
          newSelected.push(item.value);
        } else {
          newSelected.splice(currentIndex, 1);
        }
        newExcluded = excluded.filter((ele) => ele !== item.value);
        break;
      case 'radio':
        if (!disallowDeselecting && selected.includes(item.value)) {
          newSelected = [];
        } else {
          newSelected = [item.value];
          newExcluded = excluded.filter((ele) => ele !== item.value);
        }
        break;
      default:
        console.error('Unknown type for FilterList');
        break;
    }
    setSelected(newSelected);
    setExcluded(newExcluded);
    onChange?.(newSelected, newExcluded);
  };

  const handleToggleExclude = (item: FilterListItemBase) => {
    let newSelected = [...selected];
    let newExcluded = [...excluded];
    switch (type) {
      case 'checkbox':
        const currentIndex = excluded.indexOf(item.value);
        if (currentIndex === -1) {
          newExcluded.push(item.value);
        } else {
          newExcluded.splice(currentIndex, 1);
        }
        newSelected = selected.filter((ele) => ele !== item.value);
        break;
      case 'radio':
        if (!disallowDeselecting && excluded.includes(item.value)) {
          newExcluded = [];
        } else {
          newSelected = selected.filter((ele) => ele !== item.value);
          newExcluded = [item.value];
        }
        break;
      default:
        console.error('Unknown type for FilterList');
        break;
    }
    setSelected(newSelected);
    setExcluded(newExcluded);
    onChange?.(newSelected, newExcluded);
  };

  const options: FilterListItemBase[] = optionsProp?.map((option) => {
    if (typeof option === 'string') {
      return { value: option, type: 'item' };
    } else {
      return option;
    }
  });

  return (
    <List
      className="flex flex-col gap-1 p-0"
      aria-multiselectable={type === 'checkbox'}
    >
      {options.map((option) =>
        option.type === 'divider' ? (
          <Divider component="li" key={option.value} />
        ) : (
          <ListItem
            aria-selected={
              option.checkboxOverride?.checked ??
              selected.includes(option.value)
            }
            aria-label={option.label ?? option.value}
            key={option.value}
            disablePadding
            className="group/li"
            secondaryAction={
              (option.secondaryAction &&
                option.secondaryAction.visible !== false) ||
              (enableExclusion && !option.disableExclusion) ? (
                <Tooltip
                  title={
                    option.secondaryAction?.tooltip ??
                    (enableExclusion ? 'Exclude' : '')
                  }
                  disableInteractive
                  placement="left"
                >
                  <IconButton
                    aria-label={`exclude ${option.label ?? option.value}`}
                    className="group/secondary"
                    size="small"
                    onClick={() => {
                      if (option.disableExclusion !== true) {
                        handleToggleExclude(option);
                      }
                      option.secondaryAction?.onClick?.();
                    }}
                  >
                    {option.secondaryAction?.icon ? (
                      selectedValues?.includes(option.value) &&
                      option.secondaryAction?.icon
                    ) : (
                      <BlockIcon
                        fontSize="small"
                        className={`transition-opacity ${excluded.includes(option.value) ? 'text-rose-400 dark:text-rose-600' : 'text-neutral-400 dark:text-neutral-600 group-hover/secondary:text-neutral-600 dark:group-hover/secondary:text-neutral-400 pointer-fine:invisible group-hover/li:visible group-focus-visible/secondary:visible'}`}
                      />
                    )}
                  </IconButton>
                </Tooltip>
              ) : undefined
            }
            slotProps={{ secondaryAction: { className: 'right-1' } }}
          >
            <ListItemButton
              onClick={() => handleToggle(option)}
              className={`p-0 rounded-lg transition-colors ${!disableSelectedBackdrop && (option.checkboxOverride?.checked ?? selected.includes(option.value)) ? 'bg-royal/10 dark:bg-cornflower-300/10' : ''}`}
            >
              {enableExclusion &&
                !disableExcludedBackdrop &&
                !option.disableExclusion && (
                  <div
                    className={`absolute inset-0 rounded-lg bg-linear-to-l from-rose-300/20 dark:from-rose-800/20 to-transparent to-75% transition-opacity opacity-0 ${excluded.includes(option.value) ? 'opacity-100' : ''}`}
                  />
                )}
              <ListItemIcon className="min-w-8">
                {type === 'checkbox' ? (
                  <Checkbox
                    checked={
                      option.checkboxOverride?.checked ??
                      selected.includes(option.value)
                    }
                    indeterminate={option.checkboxOverride?.indeterminate}
                    disabled={option.checkboxOverride?.disabled}
                    aria-disabled={option.checkboxOverride?.disabled}
                    disableRipple
                    tabIndex={-1}
                    size="small"
                    slotProps={{ root: { className: 'p-2' } }}
                    value={option.value}
                  />
                ) : type === 'radio' ? (
                  <Radio
                    checked={
                      option.checkboxOverride?.checked ??
                      selected.includes(option.value)
                    }
                    disabled={option.checkboxOverride?.disabled}
                    aria-disabled={option.checkboxOverride?.disabled}
                    disableRipple
                    disableTouchRipple
                    tabIndex={-1}
                    size="small"
                    slotProps={{ root: { className: 'p-2' } }}
                    value={option.value}
                  />
                ) : undefined}
              </ListItemIcon>
              {renderOptionContent ? (
                <div className="flex flex-row justify-start items-center">
                  {renderOptionContent(
                    { slotProps: { primary: { className: 'text-sm' } } },
                    option,
                  )}
                </div>
              ) : (
                <ListItemText
                  primary={option.label ?? option.value}
                  slotProps={{ primary: { className: 'text-sm' } }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ),
      )}
    </List>
  );
}
