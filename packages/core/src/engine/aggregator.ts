import type { AggregationType } from '../types/interfaces';

export function calculateAggregates<T>(
  items: T[],
  field: keyof T,
  type: AggregationType,
): number {
  if (!items || items.length === 0) return 0;

  const values = items.map((item) => Number(item[field]) || 0);

  switch (type) {
    case 'sum':
      return values.reduce((sum, val) => sum + val, 0);
    case 'avg':
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    case 'min':
      return Math.min(...values);
    case 'max':
      return Math.max(...values);
    case 'count':
      return values.length;
    default:
      return 0;
  }
}

// import { Row, AggregationType } from '../types/interfaces';

// export function calculateAggregates<T extends Row>(
//   items: T[],
//   measure: keyof T,
//   aggregationType: AggregationType,
// ): number {
//   if (items.length === 0) {
//     return 0;
//   }

//   const validValues = items
//     .map((item) => {
//       const value = Number(item[measure]);
//       if (isNaN(value)) {
//         return null;
//       }
//       return value;
//     })
//     .filter((value): value is number => value !== null);

//   if (validValues.length === 0) {
//     return 0;
//   }

//   const sum = validValues.reduce((acc, value) => acc + value, 0);

//   let result: number;

//   switch (aggregationType) {
//     case 'sum':
//       result = sum;
//       break;
//     case 'avg':
//       result = sum / validValues.length;
//       break;
//     case 'count':
//       result = validValues.length;
//       break;
//     case 'min':
//       result = Math.min(...validValues);
//       break;
//     case 'max':
//       result = Math.max(...validValues);
//       break;
//     default:
//       return 0;
//   }
//   return result;
// }

{
  /*We'll use this function later while creating dropdown list for column */
}

// Render Multi-Select Dropdown with Checkboxes
// function renderMultiSelectWithCheckboxes() {
//     const container = document.getElementById('multiSelectContainer');
//     if (!container) {
//         console.error('Multi-select container (#multiSelectContainer) is missing.');
//         return;
//     }

//     container.innerHTML = '';

//     const inputBox = document.createElement('div');
//     inputBox.className = 'multi-select-input';
//     inputBox.tabIndex = 0;
//     inputBox.style.padding = '10px';
//     inputBox.style.border = '1px solid #ccc';
//     inputBox.style.borderRadius = '5px';
//     inputBox.style.cursor = 'pointer';
//     inputBox.textContent = 'Select Columns';
//     inputBox.onclick = () => dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';

//     const dropdown = document.createElement('div');
//     dropdown.className = 'multi-select-dropdown';
//     dropdown.style.position = 'absolute';
//     dropdown.style.background = '#fff';
//     dropdown.style.border = '1px solid #ccc';
//     dropdown.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
//     dropdown.style.width = '200px';
//     dropdown.style.maxHeight = '150px';
//     dropdown.style.overflowY = 'auto';
//     dropdown.style.display = 'none';

//     config.columns.forEach(column => {
//         const optionContainer = document.createElement('div');
//         optionContainer.style.padding = '5px';

//         const checkbox = document.createElement('input');
//         checkbox.type = 'checkbox';
//         checkbox.value = column.field;
//         checkbox.style.marginRight = '10px';

//         const label = document.createElement('label');
//         label.textContent = column.label;

//         optionContainer.appendChild(checkbox);
//         optionContainer.appendChild(label);
//         dropdown.appendChild(optionContainer);
//     });

//     const applyButton = document.createElement('button');
//     applyButton.textContent = 'Apply';
//     applyButton.style.margin = '10px';
//     applyButton.style.padding = '5px 10px';
//     applyButton.style.border = 'none';
//     applyButton.style.backgroundColor = '#007BFF';
//     applyButton.style.color = '#fff';
//     applyButton.style.borderRadius = '5px';
//     applyButton.style.cursor = 'pointer';

//     applyButton.onclick = () => {
//         const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]:checked');
//         const selectedColumns = Array.from(checkboxes).map(checkbox => checkbox.value);
//         const selectedOperation = document.getElementById('operationDropdown').value;

//         if (selectedColumns.length !== 2) {
//             alert('Please select exactly two columns to perform the operation.');
//             return;
//         }

//         const processedData = data.map(row => {
//             const [col1, col2] = selectedColumns;
//             let result;
//             switch (selectedOperation) {
//                 case 'Sum':
//                     result = (row[col1] || 0) + (row[col2] || 0);
//                     break;
//                 case 'Avg':
//                     result = ((row[col1] || 0) + (row[col2] || 0)) / 2;
//                     break;
//                 case 'Count':
//                     result = [col1, col2].reduce(
//                         (count, col) => count + (row[col] !== undefined ? 1 : 0),
//                         0
//                     );
//                     break;
//                 case 'min':
//                     result = Math.min(row[col1] || Infinity, row[col2] || Infinity);
//                     break;
//                 case 'max':
//                     result = Math.max(row[col1] || -Infinity, item[col2] || -Infinity);
//                     break;
//                 default:
//                     result = 'Invalid Operation';
//             }
//             return { ...row, result };
//         });

//         const updatedColumns = [
//             ...config.columns.filter(col => col.field !== 'result'),
//             { field: 'result', label: `${selectedOperation} of ${selectedColumns.join(' & ')}` },
//         ];
//         console.log(processedData)
//         engine = new PivotEngine({ data: processedData, columns: updatedColumns });
//         renderTable();
//         dropdown.style.display = 'none';
//     };

//     dropdown.appendChild(applyButton);

//     document.addEventListener('click', (e) => {
//         if (!container.contains(e.target)) {
//             dropdown.style.display = 'none';
//         }
//     });

//     container.appendChild(inputBox);
//     container.appendChild(dropdown);
// }
