import {
  GroupConfig,
  PivotTableConfig,
  SortConfig,
  Group,
  ProcessedDataResult,
} from '../types/interfaces';
import { applySort } from './sorter';

export function processData<T extends Record<string, any>>(
  config: PivotTableConfig<T>,
  sortConfig: SortConfig | null = null,
  groupConfig: GroupConfig | null = null,
): ProcessedDataResult<T> {
  let processedData = [...config.data];

  if (sortConfig) {
    processedData = applySort(processedData, [sortConfig]);
  }

  let groups: Group[] = [];

  if (groupConfig) {
    const { rowFields, columnFields, grouper } = groupConfig;
    const fields = [...rowFields, ...columnFields];
    groups = createGroups(processedData, fields, grouper);
  }

  return { data: processedData, groups };
}

function createGroups<T extends Record<string, any>>(
  data: T[],
  fields: string[],
  grouper: (item: T, fields: string[]) => string,
): Group[] {
  if (!fields || fields.length === 0) {
    return [{ key: 'All', items: data, subgroups: [], aggregates: {} }];
  }

  const groups: { [key: string]: Group } = {};

  data.forEach((item) => {
    const key = grouper(item, fields);
    if (!groups[key]) {
      groups[key] = { key, items: [], subgroups: [], aggregates: {} };
    }
    groups[key].items.push(item);
  });

  if (fields.length > 1) {
    Object.values(groups).forEach((group) => {
      group.subgroups = createGroups(group.items, fields.slice(1), grouper);
    });
  }

  return Object.values(groups);
}
