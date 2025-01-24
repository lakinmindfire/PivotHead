export interface AxisConfig {
  uniqueName: string;
  caption?: string;
  sortOrder?: 'asc' | 'desc';
}
export interface Column {
  field: string;
  label: string;
  type?: 'string' | 'number' | 'date';
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
  type?: 'measure' | 'dimension';
  aggregation?: AggregationType;
}

export interface RowSize {
  index: number;
  height: number;
}

// Define the structure for expanded rows
export interface ExpandedState {
  [key: string]: boolean;
}

// Define the configuration for grouping
export interface GroupConfig {
  rowFields: string[];
  columnFields: string[];
  grouper: (item: any, fields: string[]) => string;
}

// Define the structure for a group
export interface Group {
  key: string;
  items: any[];
  subgroups?: Group[];
  aggregates: { [key: string]: number };
  level?: number;
}

// Data formatting configuration
export interface FormatOptions {
  type: 'currency' | 'number' | 'percentage' | 'date';
  locale?: string;
  currency?: string;
  decimals?: number;
  dateFormat?: string;
}

// Supported aggregation types
export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max';

// Measure definition
export interface Measure {
  field: string;
  label: string;
  type: 'number';
  format?: FormatOptions;
  aggregation?: AggregationType;
}

// Dimension definition
export interface Dimension {
  field: string;
  label: string;
  type: 'string' | 'date';
  format?: FormatOptions;
}

export interface PivotTableState<T> {
  data: T[];
  processedData: ProcessedData;
  sortConfig: SortConfig[];
  rows: AxisConfig[];
  columns: AxisConfig[];
  measures: MeasureConfig[];
  rowSizes: RowSize[];
  expandedRows: ExpandedState;
  groupConfig: GroupConfig | null;
  groups: Group[];
  selectedMeasures: MeasureConfig[];
  selectedDimensions: Dimension[];
  selectedAggregation: AggregationType;
  formatting: { [key: string]: FormatOptions };
  columnWidths: { [key: string]: number };
  isResponsive: boolean;
  rowGroups: Group[];
  columnGroups: Group[];
}

export interface PivotTableConfig<T> {
  data: T[];
  rows: AxisConfig[];
  columns: AxisConfig[];
  measures: MeasureConfig[];
  dimensions: Dimension[];
  groupConfig?: GroupConfig | null;
  formatting?: { [key: string]: FormatOptions };
  defaultAggregation: AggregationType;
  isResponsive?: boolean;
  initialSort?: SortConfig[];
}

export interface MeasureConfig {
  uniqueName: string;
  caption?: string;
  aggregation: AggregationType;
  format?: FormatOptions;
  formula?: (item: any) => number;
  sortabled?: boolean;
}

export interface ProcessedData {
  headers: string[];
  rows: any[][];
  totals: Record<string, number>;
}

export interface ProcessedDataResult<T> {
  data: T[];
  groups: Group[];
}

// Chart types supported
export type ChartType = 'bar' | 'line' | 'pie' | 'scatter';

// Pivot data structure
export interface PivotData {
  [key: string]: string | number;
}

export type Row = {
  [key: string]: any;
};

export type Config = {
  columns: Column[];
  data: Row[];
};
