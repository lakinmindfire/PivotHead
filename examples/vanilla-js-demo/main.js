/**
 * PivotHead Demo
 *
 * This file demonstrates the usage of the PivotheadCore library to create an interactive pivot table.
 * Features include:
 * - Sorting
 * - Grouping
 * - Column resizing
 * - Column reordering (drag and drop)
 * - Row reordering (drag and drop)
 */
import { createHeader } from './header.js';
if (typeof PivotheadCore === 'undefined') {
  console.error(
    'PivotheadCore is not defined. Make sure the library is loaded correctly.',
  );
}


// Importing the Package
const { PivotEngine } = PivotheadCore;

// Dummy data.
import { data2 as data } from './utils/testData.js';

// Updated configuration for the pivot table
const config = {
  data: data,
  rows: [{ uniqueName: 'product', caption: 'Product' }],
  columns: [{ uniqueName: 'region', caption: 'Region' }],
  measures: [
    {
      uniqueName: 'sales',
      caption: 'Total Sales',
      aggregation: 'sum',
      format: { 
        type: 'currency', 
        currency: 'USD',
        locale: 'en-US',
        decimals: 4
      },
      sortable: true,
    },
    {
      uniqueName: 'quantity',
      caption: 'Total Quantity',
      aggregation: 'sum',
      format: { 
        type: 'number',
        decimals: 2,
        locale: 'en-US'
      },
      sortable: false,
    },
    {
      uniqueName: 'averageSale',
      caption: 'Average Sale',
      aggregation: 'avg',
      format: { 
        type: 'number'
      },
      formula: (item) => item.sales / item.quantity,
      sortable: true,
    },
    {
      uniqueName: 'sales',
      caption: 'Max Sale',
      aggregation: 'max',
      format: { 
        type: 'currency', 
        currency: 'USD',
        locale: 'en-US',
        decimals: 4
      },
      sortable: true,
    },
    {
      uniqueName: 'sales',
      caption: 'Min Sale',
      aggregation: 'min',
      format: { 
        type: 'currency', 
        currency: 'USD',
        locale: 'en-US',
        decimals: 4
      },
      sortable: true,
    },
  ],
  dimensions: [
    { field: 'product', label: 'Product', type: 'string', sortable: true },
    { field: 'region', label: 'Region', type: 'string', sortable: false },
    { field: 'date', label: 'Date', type: 'date', sortable: true },
    { field: 'sales', label: 'Sales', type: 'number', sortable: true },
    { field: 'quantity', label: 'Quantity', type: 'number', sortable: false },
  ],
  defaultAggregation: 'sum',
  isResponsive: true,
  // Add initial sort configuration
  initialSort: [
    {
      field: "sales",
      direction: "desc",
      type: "measure",
      aggregation: "sum",
    },
  ],
  groupConfig: {
    rowFields: ['product'],
    columnFields: ['region'],
    grouper: (item, fields) => fields.map((field) => item[field]).join(' - '),
  },
  formatting: {
    sales: { 
      type: 'currency', 
      currency: 'USD',
      locale: 'en-US',
      decimals: 4
    },
    quantity: { 
      type: 'number',
      // decimals: 2,
      // locale: 'en-US'
    },
    averageSale: { 
      type: 'currency', 
      currency: 'USD',
      locale: 'en-US',
      decimals: 4
    },
    maxSale: { 
      type: 'currency', 
      currency: 'USD',
      locale: 'en-US',
      decimals: 4
    },
    minSale: { 
      type: 'currency', 
      currency: 'USD',
      locale: 'en-US',
      decimals: 4
    }
  },
  conditionalFormatting: [
    {
      value: {
        type: 'Number',
        operator: 'Greater than',
        value1: '1000',
        value2: '',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#ffffff',
        backgroundColor: '#4CAF50',
      },
    },
    {
      value: {
        type: 'Number',
        operator: 'Less than',
        value1: '500',
        value2: '',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#ffffff',
        backgroundColor: '#F44336',
      },
    },
    {
      value: {
        type: 'Number',
        operator: 'Between',
        value1: '500',
        value2: '1000',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#000000',
        backgroundColor: '#FFC107',
      },
    },
    {
      value: {
        type: 'Number',
        operator: 'Greater than',
        value1: '50',
        value2: '',
      },
      format: {
        font: 'Arial',
        size: '14px',
        color: '#ffffff',
        backgroundColor: '#2196F3',
      },
    },
  ],
};
// Initialize PivotEngine
let engine = new PivotEngine(config);


export function onSectionItemDrop(droppedFields) {
  let droppedFieldsInSections=JSON.stringify({
    rows: Array.from(droppedFields.rows),
    columns: Array.from(droppedFields.columns),
    values: Array.from(droppedFields.values),
    filters: Array.from(droppedFields.filters)
  });
  const parsedDroppedFieldsInSections=JSON.parse(droppedFieldsInSections)

  const transformedRows=parsedDroppedFieldsInSections.rows.map((rowField)=>{ return { uniqueName:rowField.toLowerCase(), caption:rowField}});
        const transformedColumns=parsedDroppedFieldsInSections.columns.map((columnField)=>{ return { uniqueName:columnField.toLowerCase(), caption:columnField}});
        // const transformedValues=parsedDroppedFieldsInSections.values.map((valueField)=>{ return { uniqueName:valueField.toLowerCase(), caption:valueField}})
        // const transformedFilters=parsedDroppedFieldsInSections.filters.map((filterField)=>{ return { uniqueName:filterField.toLowerCase(), caption:filterField}})

        //TODO: for now only-applicable to rows and columns, will do the same for values and global filters in next iteration
        engine.state.rows=transformedRows;
        engine.state.columns=transformedColumns;

        renderTable();
}

function renderTable() {
  const state = engine.getState();
  const container = document.getElementById('pivotTable');
  if (!container) {
    console.error('Container element with id "pivotTable" not found');
    return;
  }

  container.innerHTML = '';

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginTop = '20px';
  table.style.border = '1px solid #dee2e6';

  const thead = document.createElement('thead');
  renderTableHeader(thead, state);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  const rowFields = state.rows.map((r) => r.uniqueName);
  const groupedData = groupData(state.data, rowFields);

  renderGroupedRows(tbody, groupedData, state, 0);

  table.appendChild(tbody);

  const tableWrapper = document.createElement('div');
  tableWrapper.style.overflowX = 'auto';
  tableWrapper.style.maxWidth = '100%';

  tableWrapper.appendChild(table);

  container.appendChild(tableWrapper);
    // Log the rendered data for debugging
    console.log("Rendered data:", groupedData)
}

function renderGroupedRows(tbody, groups, state, level) {
  const columnField = state.columns[0]?.uniqueName;
  const uniqueColumnValues = columnField
    ? [...new Set(data.map((item) => item[columnField]))]
    : [];

  Object.entries(groups).forEach(([key, value]) => {
    const tr = document.createElement('tr');

    // Add group header cells
    const groupKeys = key.split(' - ');
    (state.rows || []).forEach((row, index) => {
      // Update: Added null check for state.rows
      const headerCell = document.createElement('td');
      headerCell.style.padding = '12px';
      headerCell.style.paddingLeft =
        index === 0 ? `${level * 20 + 10}px` : '12px';
      headerCell.style.borderBottom = '1px solid #dee2e6';
      headerCell.style.fontWeight = 'bold';
      headerCell.textContent = index < groupKeys.length ? groupKeys[index] : '';
      tr.appendChild(headerCell);
    });

    // Add data cells for leaf nodes
    if (Array.isArray(value)) {
      uniqueColumnValues.forEach((columnValue) => {
        const columnItems = value.filter(
          (item) => item[columnField] === columnValue,
        );

        state.measures.forEach((measure) => {
          const td = document.createElement('td');
          td.style.padding = '12px';
          td.style.borderBottom = '1px solid #dee2e6';
          td.style.borderRight = '1px solid #dee2e6';
          td.style.backgroundColor = '#f8f9fa';
          td.style.textAlign = 'center';

          if (columnItems.length > 0) {
            let aggregateValue;
            if (measure.aggregation === 'max') {
              aggregateValue = Math.max(...columnItems.map(item => engine.calculateMeasureValue(item, measure)));
            } else if (measure.aggregation === 'min') {
              aggregateValue = Math.min(...columnItems.map(item => engine.calculateMeasureValue(item, measure)));
            } else if (measure.aggregation === 'count') {
              aggregateValue = columnItems.length;
            } else {
              aggregateValue = columnItems.reduce(
                (sum, item) => sum + engine.calculateMeasureValue(item, measure),
                0,
              );
              if (measure.aggregation === 'avg') {
                aggregateValue /= columnItems.length;
              }
            }

            td.textContent = engine.formatValue(
              aggregateValue,
              measure.uniqueName,
            );

            // Apply condition formatting
            applyConditionalFormatting(td, aggregateValue, measure.uniqueName);
          } else {
            td.textContent = engine.formatValue(0, measure.uniqueName);
          }

          tr.appendChild(td);
        });
      });
    } else {
      // Add empty cells for non-leaf nodes
      uniqueColumnValues.forEach(() => {
        state.measures.forEach(() => {
          const td = document.createElement('td');
          td.style.padding = '12px';
          td.style.borderBottom = '1px solid #dee2e6';
          td.style.borderRight = '1px solid #dee2e6';
          tr.appendChild(td);
        });
      });
    }

    tbody.appendChild(tr);

    // Recursively render subgroups
    if (!Array.isArray(value)) {
      renderGroupedRows(tbody, value, state, level + 1);
    }
  });
}

function applyConditionalFormatting(td, value, measureName) {
  if (config.conditionalFormatting && config.conditionalFormatting.length > 0) {
    config.conditionalFormatting.forEach((rule) => {
      if (rule.value.type === 'All values' || 
          (rule.value.type === 'Number' && typeof value === 'number') ||
          (rule.value.type === 'Text' && typeof value === 'string')) {
        let applyFormat = false;
        switch (rule.value.operator) {
          case 'Greater than':
            applyFormat = value > parseFloat(rule.value.value1);
            break;
          case 'Less than':
            applyFormat = value < parseFloat(rule.value.value1);
            break;
          case 'Between':
            applyFormat = value >= parseFloat(rule.value.value1) && 
                          value <= parseFloat(rule.value.value2);
            break;
          case 'Equal to':
            applyFormat = value === parseFloat(rule.value.value1) || value === rule.value.value1;
            break;
        }
        if (applyFormat) {
          td.style.fontFamily = rule.format.font;
          td.style.fontSize = rule.format.size;
          td.style.color = rule.format.color;
          td.style.backgroundColor = rule.format.backgroundColor;
        }
      }
    });
  }
}

function renderTableHeader(thead, state) {
  // Column header row
  const columnHeaderRow = document.createElement('tr');

  // Add empty cell for row headers
  const emptyHeaderCell = document.createElement('th');
  emptyHeaderCell.colSpan = state.rows.length;
  emptyHeaderCell.style.padding = '10px';
  emptyHeaderCell.style.backgroundColor = '#f0f0f0';
  emptyHeaderCell.style.borderBottom = '2px solid #ddd';
  columnHeaderRow.appendChild(emptyHeaderCell);

  // Get unique column values based on the configured column fields
  const columnField = state.columns[0]?.uniqueName;
  const uniqueColumnValues = columnField
    ? [...new Set(data.map((item) => item[columnField]))]
    : [];

  // Add column headers with colspan
  uniqueColumnValues.forEach((value) => {
    const th = document.createElement('th');
    th.textContent = value;
    th.colSpan = state.measures.length;
    th.style.padding = '12px';
    th.style.backgroundColor = '#f8f9fa';
    th.style.borderBottom = '2px solid #dee2e6';
    th.style.borderRight = '1px solid #dee2e6';
    columnHeaderRow.appendChild(th);
  });
  thead.appendChild(columnHeaderRow);

  // Second header row for measures
  const measureHeaderRow = document.createElement('tr');

  // Add empty cell for row headers
  state.rows.forEach((row) => {
    const th = document.createElement('th');
    th.style.padding = '12px';
    th.style.backgroundColor = '#f8f9fa';
    th.style.borderBottom = '2px solid #dee2e6';
    th.style.cursor = 'pointer';

    const headerContent = document.createElement('div');
    headerContent.style.display = 'flex';
    headerContent.style.alignItems = 'center';
    headerContent.style.justifyContent = 'space-between';

    const headerText = document.createElement('span');
    headerText.textContent = row.caption;
    headerContent.appendChild(headerText);

    th.appendChild(headerContent);
    measureHeaderRow.appendChild(th);
  });

  // Add measure headers for each column value
  uniqueColumnValues.forEach(() => {
    state.measures.forEach((measure) => {
      const th = document.createElement('th');
      th.style.padding = '12px';
      th.style.backgroundColor = '#f8f9fa';
      th.style.borderBottom = '2px solid #dee2e6';
      th.style.borderRight = '1px solid #dee2e6';

      const headerContent = document.createElement('div');
      headerContent.style.display = 'flex';
      headerContent.style.alignItems = 'center';
      headerContent.style.justifyContent = 'space-between';

      const headerText = document.createElement('span');
      headerText.textContent = measure.caption;
      headerContent.appendChild(headerText);

      if (measure.sortable) {
        const sortIcon = createSortIcon(measure.uniqueName, 'column');
        headerContent.appendChild(sortIcon);
        th.addEventListener('click', () => handleSort(measure.uniqueName));
      }

      th.appendChild(headerContent);
      measureHeaderRow.appendChild(th);
    });
  });

  thead.appendChild(measureHeaderRow);
}

function handleSort(field, direction) {
  console.log(`Sorting by field: ${field}`);
 // Get current state
 const state = engine.getState()
 const currentSortConfig = state.sortConfig?.[0]

 // Toggle direction if clicking the same field
 let newDirection = direction || "asc"
 if (currentSortConfig && currentSortConfig.field === field) {
   newDirection = currentSortConfig.direction === "asc" ? "desc" : "asc"
 }

 // Call engine's sort method
 engine.sort(field, newDirection)

 // Force a re-render of the table
 renderTable()

 // Log the sort operation for debugging
 console.log(`Sorting by ${field} in ${newDirection} order`)
}

function createSortIcon(field, axis) {
  const icon = document.createElement('span');
  const state = engine.getState();
  const currentSort = state.sortConfig?.[0];
  
  // Set the appropriate sort icon based on current sort state
  if (currentSort && currentSort.field === field) {
    icon.innerHTML = currentSort.direction === 'asc' ? '&#8593;' : '&#8595;';
  } else {
    icon.innerHTML = '&#8645;'; // Default unsorted state
  }
  
  icon.style.cursor = 'pointer';
  icon.style.marginLeft = '5px';

  icon.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent event bubbling
    const currentDirection = state.sortConfig?.[0]?.direction;
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    handleSort(field, newDirection);
  });

  return icon;
}


function updateFormatting(newConfig) {
  config.conditionalFormatting = newConfig.conditionalFormatting;
  renderTable();
}

function groupData(data, groupFields) {
  if (!groupFields || groupFields.length === 0) return {};

  const result = {};

  data.forEach((item) => {
    let current = result;

    groupFields.forEach((field, index) => {
      const value = String(item[field]); // Convert all values to string for consistent grouping

      if (!current[value]) {
        current[value] = index === groupFields.length - 1 ? [] : {};
      }

      if (index === groupFields.length - 1) {
        current[value].push(item);
      } else {
        current = current[value];
      }
    });
  });

  return result;
}

export function formatTable(config){
  engine = new PivotEngine(config);
  renderTable();
}



// Initialize the table when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const pivotTableContainer = document.getElementById('pivotTable');

  if (!pivotTableContainer) {
    console.error(
      'Pivot table container (#pivotTable) is missing. Ensure the HTML structure is correct.',
    );
    return;
  }
  createHeader(config);
  renderTable();
});