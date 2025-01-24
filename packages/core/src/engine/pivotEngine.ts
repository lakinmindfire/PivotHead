import {
  AggregationType,
  Dimension,
  Group,
  GroupConfig,
  MeasureConfig,
  PivotTableConfig,
  PivotTableState,
  ProcessedData,
  RowSize,
  SortConfig,
} from '../types/interfaces';
import { calculateAggregates } from './aggregator';
import { processData } from './dataProcessor';
import { applySort, sortGroups } from './sorter';

/**
 * Creates an instance of PivotEngine.
 * @param {PivotTableConfig<T>} config - The configuration for the pivot table.
 */
export class PivotEngine<T extends Record<string, any>> {
  private config: PivotTableConfig<T>;
  private state: PivotTableState<T>;

  constructor(config: PivotTableConfig<T>) {
    this.config = {
      ...config,
      defaultAggregation: config.defaultAggregation || 'sum',
      isResponsive: config.isResponsive ?? true,
    };
    // Initialize state
    this.state = {
      data: config.data || [],
      processedData: { headers: [], rows: [], totals: {} },
      rows: config.rows || [],
      columns: config.columns || [],
      measures: config.measures || [],
      sortConfig: [],
      rowSizes: this.initializeRowSizes(config.data || []),
      expandedRows: {},
      groupConfig: config.groupConfig || null,
      groups: [],
      selectedMeasures: config.measures || [],
      selectedDimensions: config.dimensions || [],
      selectedAggregation: this.config.defaultAggregation,
      formatting: config.formatting || {},
      columnWidths: {},
      isResponsive: this.config.isResponsive ?? true,
      rowGroups: [],
      columnGroups: [],
    };

    // Process data after state initialization
    this.state.processedData = this.processData(this.state.data);

    if (this.state.groupConfig) {
      this.applyGrouping();
    }
  }

  /**
   * Initializes row sizes for the pivot table.
   * @param {T[]} data - The data to initialize row sizes for.
   * @returns {RowSize[]} An array of row sizes.
   * @private
   */
  private initializeRowSizes(data: T[]): RowSize[] {
    return data.map((_, index) => ({ index, height: 40 }));
  }

  /**
   * Processes the data for the pivot table.
   * @param {T[]} data - The data to process.
   * @returns {ProcessedData} The processed data including headers, rows, and totals.
   * @private
   */
  private processData(data: T[]): ProcessedData {
    return {
      headers: this.generateHeaders(),
      rows: this.generateRows(data),
      totals: this.calculateTotals(data),
    };
  }

  /**
   * Generates headers for the pivot table.
   * @returns {string[]} An array of header strings.
   * @private
   */
  private generateHeaders(): string[] {
    const rowHeaders = this.state.rows
      ? this.state.rows.map((r) => r.caption || r.uniqueName)
      : [];
    const columnHeaders = this.state.columns
      ? this.state.columns.map((c) => c.caption || c.uniqueName)
      : [];
    return [...rowHeaders, ...columnHeaders];
  }

  /**
   * Generates rows for the pivot table.
   * @param {T[]} data - The data to generate rows from.
   * @returns {any[][]} A 2D array representing the rows.
   * @private
   */
  private generateRows(data: T[]): any[][] {
    if (!data || !this.state.rows || !this.state.columns) {
      return [];
    }
    return data.map((item) => [
      ...this.state.rows.map((r) => item[r.uniqueName]),
      ...this.state.columns.map((c) => item[c.uniqueName]),
      ...this.state.measures.map((m) => this.calculateMeasureValue(item, m)),
    ]);
  }

  /**
   * Calculates the value for a specific measure.
   * @param {T} item - The data item.
   * @param {MeasureConfig} measure - The measure configuration.
   * @returns {number} The calculated measure value.
   * @private
   */
  private calculateMeasureValue(item: T, measure: MeasureConfig): number {
    if (measure.formula && typeof measure.formula === 'function') {
      return measure.formula(item);
    }
    return item[measure.uniqueName] || 0;
  }

  /**
   * Calculates totals for each measure in the pivot table.
   * @param {T[]} data - The data to calculate totals from.
   * @returns {Record<string, number>} An object with measure names as keys and their totals as values.
   * @private
   */
  private calculateTotals(data: T[]): Record<string, number> {
    const totals: Record<string, number> = {};

    this.state.measures.forEach((measure) => {
      const { uniqueName, aggregation } = measure;
      let total = 0;

      if (aggregation === 'sum') {
        total = data.reduce((sum, item) => sum + (item[uniqueName] || 0), 0);
      } else if (aggregation === 'avg') {
        total =
          data.reduce((sum, item) => sum + (item[uniqueName] || 0), 0) /
          data.length;
      } else if (aggregation === 'max') {
        total = Math.max(...data.map((item) => item[uniqueName] || 0));
      } else if (aggregation === 'min') {
        total = Math.min(...data.map((item) => item[uniqueName] || 0));
      } else if (aggregation === 'count') {
        total = data.length;
      }

      totals[uniqueName] = total;
    });

    return totals;
  }

  /**
   * Sets the measures for the pivot table.
   * @param {MeasureConfig[]} measureFields - The measure configurations to set.
   * @public
   */
  public setMeasures(measureFields: MeasureConfig[]) {
    this.state.selectedMeasures = measureFields;
    this.state.processedData = this.processData(this.state.data);
    this.updateAggregates();
  }

  /**
   * Sets the dimensions for the pivot table.
   * @param {Dimension[]} dimensionFields - The dimension configurations to set.
   * @public
   */
  public setDimensions(dimensionFields: Dimension[]) {
    this.state.selectedDimensions = dimensionFields;
    this.state.processedData = this.processData(this.state.data);
    this.updateAggregates();
  }

  /**
   * Sets the aggregation type for the pivot table.
   * @param {AggregationType} type - The aggregation type to set.
   * @public
   */
  public setAggregation(type: AggregationType) {
    this.state.selectedAggregation = type;
    this.state.processedData = this.processData(this.state.data);
    this.updateAggregates();
    this.updateAggregates();
  }

  /**
   * Formats a value based on the specified field's format.
   * @param {any} value - The value to format.
   * @param {string} field - The field name to use for formatting.
   * @returns {string} The formatted value as a string.
   * @public
   */
  public formatValue(value: any, field: string): string {
    const format = this.state.formatting[field];
    if (!format) return String(value);

    try {
      switch (format.type) {
        case 'currency':
          return new Intl.NumberFormat(format.locale || 'en-US', {
            style: 'currency',
            currency: format.currency || 'USD',
            minimumFractionDigits: format.decimals || 0,
            maximumFractionDigits: format.decimals || 0,
          }).format(value);
        case 'number':
          return new Intl.NumberFormat(format.locale || 'en-US', {
            minimumFractionDigits: format.decimals || 0,
            maximumFractionDigits: format.decimals || 0,
          }).format(value);
        case 'percentage':
          return new Intl.NumberFormat(format.locale || 'en-US', {
            style: 'percent',
            minimumFractionDigits: format.decimals || 0,
          }).format(value);
        case 'date':
          return new Date(value).toLocaleDateString(format.locale || 'en-US', {
            dateStyle: 'medium',
          });
        default:
          return String(value);
      }
    } catch (error) {
      console.error(`Error formatting value for field ${field}:`, error);
      return String(value);
    }
  }

  /**
   * Sorts the pivot table data based on the specified field and direction.
   * @param {string} field - The field to sort by.
   * @param {'asc' | 'desc'} direction - The sort direction.
   * @public
   */
  public sort(field: string, direction: 'asc' | 'desc') {
    const measure = this.state.measures.find((m) => m.uniqueName === field);

    const newSortConfig: SortConfig = {
      field,
      direction,
      type: measure ? 'measure' : 'dimension',
      aggregation: measure?.aggregation,
    };

    this.state.sortConfig = [newSortConfig];
    this.applySort();

    // Log the new state for debugging
    console.log('New state after sorting:', this.state);
  }

  private applySort() {
    const sortedData = this.sortData(this.state.data, this.state.sortConfig[0]);
    this.state.data = sortedData;

    if (this.state.groups.length > 0) {
      this.state.groups = this.sortGroups(
        this.state.groups,
        this.state.sortConfig[0],
      );
    }

    this.state.processedData = this.processData(this.state.data);
    this.updateAggregates();
  }

  private sortData(data: T[], sortConfig: SortConfig): T[] {
    return [...data].sort((a, b) => {
      const aValue = this.getFieldValue(a, sortConfig);
      const bValue = this.getFieldValue(b, sortConfig);

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  private getFieldValue(item: T, sortConfig: SortConfig): number {
    if (sortConfig.type === 'measure') {
      const measure = this.state.measures.find(
        (m) => m.uniqueName === sortConfig.field,
      );
      if (measure && measure.formula) {
        return measure.formula(item);
      }
    }
    return item[sortConfig.field] as number;
  }

  private sortGroups(groups: Group[], sortConfig: SortConfig): Group[] {
    return [...groups].sort((a, b) => {
      const aValue =
        a.aggregates[`${sortConfig.aggregation}_${sortConfig.field}`] || 0;
      const bValue =
        b.aggregates[`${sortConfig.aggregation}_${sortConfig.field}`] || 0;

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Updates aggregates for all groups in the pivot table.
   * @private
   */
  private updateAggregates() {
    const updateGroupAggregates = (group: Group) => {
      this.state.measures.forEach((measure) => {
        const aggregateKey = `${this.state.selectedAggregation}_${measure.uniqueName}`;
        if (measure.formula && typeof measure.formula === 'function') {
          // Handle custom measures
          const formulaResults = group.items.map((item) =>
            measure.formula!(item),
          );
          group.aggregates[aggregateKey] = calculateAggregates(
            formulaResults.map((value) => ({ value })),
            'value' as keyof { value: number },
            measure.aggregation ||
              (this.state.selectedAggregation as AggregationType),
          );
        } else {
          group.aggregates[aggregateKey] = calculateAggregates(
            group.items,
            measure.uniqueName as keyof T,
            (measure.aggregation as AggregationType) ||
              (this.state.selectedAggregation as AggregationType),
          );
        }
      });

      if (group.subgroups) {
        group.subgroups.forEach(updateGroupAggregates);
      }
    };

    this.state.groups.forEach(updateGroupAggregates);
  }

  /**
   * Applies grouping to the pivot table data.
   * @private
   */
  private applyGrouping() {
    if (!this.state.groupConfig) return;

    const { rowFields, columnFields, grouper } = this.state.groupConfig;

    if (!rowFields || !columnFields || !grouper) {
      console.error('Invalid groupConfig:', this.state.groupConfig);
      return;
    }

    const { data, groups } = processData(
      this.config,
      this.state.sortConfig[0] || null,
      this.state.groupConfig,
    );

    this.state.data = data;
    this.state.groups = groups;
    this.updateAggregates();
    this.state.processedData = this.processData(this.state.data);
  }

  /**
   * Creates groups based on the specified fields and grouper function.
   * @param {T[]} data - The data to group.
   * @param {string[]} fields - The fields to group by.
   * @param {(item: T, fields: string[]) => string} grouper - The grouping function.
   * @returns {Group[]} An array of grouped data.
   * @private
   */
  private createGroups(
    data: T[],
    fields: string[],
    grouper: (item: T, fields: string[]) => string,
  ): Group[] {
    if (!fields || fields.length === 0 || !data) {
      return [
        {
          key: 'All',
          items: data || [],
          aggregates: {},
        },
      ];
    }

    const groups: { [key: string]: Group } = {};

    data.forEach((item) => {
      if (item && grouper) {
        const key = grouper(item, fields);
        if (!groups[key]) {
          groups[key] = { key, items: [], subgroups: [], aggregates: {} };
        }
        groups[key].items.push(item);
      }
    });

    if (fields.length > 1) {
      Object.values(groups).forEach((group) => {
        if (group && group.items) {
          group.subgroups = this.createGroups(
            group.items,
            fields.slice(1),
            grouper,
          );
        }
      });
    }

    // Calculate aggregates for each group
    Object.values(groups).forEach((group) => {
      if (group && group.items && this.state.measures) {
        this.state.measures.forEach((measure) => {
          if (measure && measure.uniqueName) {
            const aggregateKey = `${this.state.selectedAggregation}_${measure.uniqueName}`;
            group.aggregates[aggregateKey] = calculateAggregates(
              group.items,
              measure.uniqueName as keyof T,
              this.state.selectedAggregation as AggregationType,
            );
          }
        });
      }
    });

    return Object.values(groups);
  }

  /**
   * Sets the group configuration for the pivot table.
   * @param {GroupConfig | null} groupConfig - The group configuration to set.
   * @public
   */
  public setGroupConfig(groupConfig: GroupConfig | null) {
    this.state.groupConfig = groupConfig;
    if (groupConfig) {
      this.applyGrouping();
    } else {
      this.state.groups = [];
      this.state.processedData = this.processData(this.state.data);
    }
  }

  /**
   * Returns the grouped data.
   * @returns {Group[]} An array of grouped data.
   * @public
   */
  public getGroupedData(): Group[] {
    return this.state.groups;
  }

  /**
   * Returns the current state of the pivot table.
   * @returns {PivotTableState<T>} The current state of the pivot table.
   * @public
   */
  public getState(): PivotTableState<T> {
    return { ...this.state };
  }

  /**
   * Resets the pivot table to its initial state.
   * @public
   */
  public reset() {
    this.state = {
      ...this.state,
      data: this.config.data || [],
      processedData: this.processData(this.config.data || []),
      sortConfig: [],
      rowSizes: this.initializeRowSizes(this.config.data || []),
      expandedRows: {},
      groupConfig: this.config.groupConfig || null,
      groups: [],
    };

    if (this.state.groupConfig) {
      this.applyGrouping();
    }
  }

  /**
   * Resizes a specific row in the pivot table.
   * @param {number} index - The index of the row to resize.
   * @param {number} height - The new height for the row.
   * @public
   */
  public resizeRow(index: number, height: number) {
    const rowIndex = this.state.rowSizes.findIndex(
      (row) => row.index === index,
    );
    if (rowIndex !== -1) {
      this.state.rowSizes[rowIndex].height = Math.max(20, height);
    }
  }

  /**
   * Toggles the expansion state of a row.
   * @param {string} rowId - The ID of the row to toggle.
   * @public
   */
  public toggleRowExpansion(rowId: string) {
    this.state.expandedRows[rowId] = !this.state.expandedRows[rowId];
  }

  /**
   * Checks if a row is expanded.
   * @param {string} rowId - The ID of the row to check.
   * @returns {boolean} True if the row is expanded, false otherwise.
   * @public
   */
  public isRowExpanded(rowId: string): boolean {
    return !!this.state.expandedRows[rowId];
  }

  /**
   * Handles dragging a row to a new position.
   * @param {number} fromIndex - The original index of the row.
   * @param {number} toIndex - The new index for the row.
   * @public
   */
  public dragRow(fromIndex: number, toIndex: number) {
    const newData = [...this.state.data];
    const [removed] = newData.splice(fromIndex, 1);
    newData.splice(toIndex, 0, removed);
    this.state.data = newData;
    this.state.rowSizes = this.state.rowSizes.map((size, index) => ({
      ...size,
      index:
        index < fromIndex || index > toIndex
          ? index
          : index < toIndex
          ? index + 1
          : index - 1,
    }));
    this.state.processedData = this.processData(this.state.data);
    this.updateAggregates();
  }

  /**
   * Handles dragging a column to a new position.
   * @param {number} fromIndex - The original index of the column.
   * @param {number} toIndex - The new index for the column.
   * @public
   */
  public dragColumn(fromIndex: number, toIndex: number) {
    const newColumns = [...this.state.columns];
    const [removed] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, removed);
    this.state.columns = newColumns;
    this.state.processedData = this.processData(this.state.data);
    this.updateAggregates();
  }
}
