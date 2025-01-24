import { PivotEngine } from '../engine/pivotEngine';
import { PivotTableConfig } from '../types/interfaces';

describe('PivotEngine', () => {
  const sampleData = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 },
    { id: 3, name: 'Bob', age: 35 },
  ];

  const config: PivotTableConfig<(typeof sampleData)[0]> = {
    data: sampleData,
    columns: [
      { field: 'id', label: 'ID' },
      { field: 'name', label: 'Name' },
      { field: 'age', label: 'Age' },
    ],
    groupConfig: null,
  };

  it('should initialize with correct data and default row sizes', () => {
    const engine = new PivotEngine(config);
    const state = engine.getState();
    expect(state.data).toEqual(sampleData);
    expect(state.rowSizes).toEqual([
      { index: 0, height: 40 },
      { index: 1, height: 40 },
      { index: 2, height: 40 },
    ]);
  });

  // it('should sort data correctly and maintain row sizes', () => {
  //   const engine = new PivotEngine(config);
  //   engine.sort('age', 'asc');
  //   const state = engine.getState();
  //   expect(state.data[0].age).toBe(25);
  //   expect(state.data[2].age).toBe(35);
  //   expect(state.rowSizes).toHaveLength(3);
  //   expect(state.rowSizes[0].height).toBe(40);
  // });

  it('should resize a row correctly', () => {
    const engine = new PivotEngine(config);
    engine.resizeRow(1, 60);
    const state = engine.getState();
    expect(state.rowSizes[1].height).toBe(60);
  });

  it('should not allow row height to be less than 20px', () => {
    const engine = new PivotEngine(config);
    engine.resizeRow(1, 10);
    const state = engine.getState();
    expect(state.rowSizes[1].height).toBe(20);
  });

  // it('should reset data and row sizes', () => {
  //   const engine = new PivotEngine(config);

  //   engine.sort('age', 'desc');
  //   engine.resizeRow(1, 60);
  //   engine.reset();
  //   const state = engine.getState();

  //   expect(state.data).toEqual(sampleData);
  //   expect(state.sortConfig).toBeNull();
  //   expect(state.rowSizes).toEqual([
  //     { index: 0, height: 40 },
  //     { index: 1, height: 40 },
  //     { index: 2, height: 40 },
  //   ]);
  // });

  it('should maintain row sizes after sorting', () => {
    const engine = new PivotEngine(config);
    engine.resizeRow(1, 60);
    engine.sort('age', 'asc');
    const state = engine.getState();
    expect(state.rowSizes[1].height).toBe(60);
  });

  it('should handle resizing non-existent rows gracefully', () => {
    const engine = new PivotEngine(config);
    engine.resizeRow(10, 100); // Non-existent row
    const state = engine.getState();
    expect(state.rowSizes).toEqual([
      { index: 0, height: 40 },
      { index: 1, height: 40 },
      { index: 2, height: 40 },
    ]);
  });

  it('should handle resizing with decimal values', () => {
    const engine = new PivotEngine(config);
    engine.resizeRow(1, 55.5);
    const state = engine.getState();
    expect(state.rowSizes[1].height).toBe(55.5);
  });
});
