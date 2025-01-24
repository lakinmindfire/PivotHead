import type { SortConfig, GroupConfig, Group } from '../types/interfaces';

export function applySort<T extends Record<string, any>>(
  data: T[],
  sortConfig: SortConfig[],
  groupConfig?: GroupConfig | null,
): T[] {
  if (!sortConfig || sortConfig.length === 0) return data;

  return [...data].sort((a, b) => {
    for (const config of sortConfig) {
      const { field, direction, type, aggregation } = config;

      if (type === 'measure') {
        const valueA = calculateMeasureValue(a, field, aggregation);
        const valueB = calculateMeasureValue(b, field, aggregation);

        if (valueA !== valueB) {
          return direction === 'asc' ? valueA - valueB : valueB - valueA;
        }
      } else {
        const valueA = a[field];
        const valueB = b[field];

        if (valueA !== valueB) {
          return direction === 'asc'
            ? valueA < valueB
              ? -1
              : 1
            : valueA > valueB
            ? -1
            : 1;
        }
      }
    }
    return 0;
  });
}

function calculateMeasureValue(
  item: Record<string, any>,
  field: string,
  aggregation?: string,
): number {
  const value = Number(item[field]) || 0;
  return value;
}

export function sortGroups(groups: Group[], sortConfig: SortConfig[]): Group[] {
  if (!sortConfig || sortConfig.length === 0) return groups;

  return [...groups].sort((a, b) => {
    for (const config of sortConfig) {
      const { field, direction } = config;
      const aggregateKeyA = `${config.aggregation || 'sum'}_${field}`;
      const aggregateKeyB = `${config.aggregation || 'sum'}_${field}`;

      const valueA = a.aggregates[aggregateKeyA] || 0;
      const valueB = b.aggregates[aggregateKeyB] || 0;

      if (valueA !== valueB) {
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
    }
    return 0;
  });
}
