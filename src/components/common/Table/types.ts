export type FilterOption = {
  label: string;
  value: string;
};

export type Column<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: FilterOption[];
  render?: (row: T) => React.ReactNode;
};
