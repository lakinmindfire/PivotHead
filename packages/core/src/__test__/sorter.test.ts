import { applySort } from '../engine/sorter';
import { SortConfig } from '../types/interfaces';

describe('applySort', () => {
  const testData = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Alice', age: 25 },
    { id: 3, name: 'Bob', age: 35 },
  ];

  it('should sort data in ascending order', () => {
    const sortConfig: SortConfig = { field: 'age', direction: 'asc' };
    const sortedData = applySort(testData, [sortConfig]);
    expect(sortedData).toEqual([
      { id: 2, name: 'Alice', age: 25 },
      { id: 1, name: 'John', age: 30 },
      { id: 3, name: 'Bob', age: 35 },
    ]);
  });

  it('should sort data in descending order', () => {
    const sortConfig: SortConfig = { field: 'age', direction: 'desc' };
    const sortedData = applySort(testData, [sortConfig]);
    expect(sortedData).toEqual([
      { id: 3, name: 'Bob', age: 35 },
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Alice', age: 25 },
    ]);
  });

  it('should sort data by string field', () => {
    const sortConfig: SortConfig = { field: 'name', direction: 'asc' };
    const sortedData = applySort(testData, [sortConfig]);
    expect(sortedData).toEqual([
      { id: 2, name: 'Alice', age: 25 },
      { id: 3, name: 'Bob', age: 35 },
      { id: 1, name: 'John', age: 30 },
    ]);
  });

  it('should return original data if sort field does not exist', () => {
    const sortConfig: SortConfig = { field: 'invalidField', direction: 'asc' };
    const sortedData = applySort(testData, [sortConfig]);
    expect(sortedData).toEqual(testData);
  });
});
