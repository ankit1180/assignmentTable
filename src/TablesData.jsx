import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import './App.css';

const firstTableData = [
  { description: 'Accounting Standard', '31-12-2021': 'IFRS', '31-12-2022': 'IFRS', '31-12-2024': 'IFRS', variance: '', variance_percent: '' },
  { description: 'Audit Method', '31-12-2021': 'IFRS16Adj', '31-12-2022': 'IFRS16Adj', '31-12-2024': 'IFRS16Adj', variance: '', variance_percent: '' },
  { description: 'Display currency', '31-12-2021': 'HKD', '31-12-2022': 'HKD', '31-12-2024': 'HKD', variance: '', variance_percent: '' },
  { description: 'Fx Rate', '31-12-2021': '0.12826', '31-12-2022': '0.12826', '31-12-2024': '0.12826', variance: '', variance_percent: '' },
  { description: 'Revenue' },
  { description: 'Passenger', '31-12-2021': '200.00', '31-12-2022': '14333.00', '31-12-2024': '15312.00', variance: '', variance_percent: '' },
  { description: 'Cargo', '31-12-2021': '800.00', '31-12-2022': '30554.00', '31-12-2024': '29312.00', variance: '', variance_percent: '' },
  { description: 'Other', '31-12-2021': '', '31-12-2022': '', '31-12-2024': '', variance: '', variance_percent: '' },
  { description: 'Total Revenue', '31-12-2021': '', '31-12-2022': '', '31-12-2024': '', variance: '', variance_percent: '' },
  { description: 'Operating Expense' },
  { description: 'Fuel', '31-12-2021': '200', '31-12-2022': '200', '31-12-2024': '300', variance: '', variance_percent: '' },
  { description: 'Labour', '31-12-2021': '300', '31-12-2022': '300', '31-12-2024': '300', variance: '', variance_percent: '' },
  { description: 'Landing fees and route charges', '31-12-2021': '300', '31-12-2022': '300', '31-12-2024': '200', variance: '', variance_percent: '' },
  { description: 'Maintenance, materials', '31-12-2021': '300', '31-12-2022': '300', '31-12-2024': '300', variance: '', variance_percent: '' },
  { description: 'Other', '31-12-2021': '', '31-12-2022': '', '31-12-2024': '', variance: '', variance_percent: '' },
  { description: 'Total Operating Expense', '31-12-2021': '', '31-12-2022': '', '31-12-2024': '', variance: '', variance_percent: '' },
  { description: 'Inflight and passenger', '31-12-2021': '300', '31-12-2022': '35814', '31-12-2024': '', variance: '', variance_percent: '' },
  { description: 'Restructuring costs', '31-12-2021': '35814', '31-12-2022': '35814', '31-12-2024': '', variance: '', variance_percent: '' }
];

const EditableTable = () => {
  const [rows, setRows] = useState(firstTableData);
  const [activeTab, setActiveTab] = useState('Profit & Loss');
  const handleChange = (index, field, event) => {
    const { value } = event.target;
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const addRowAfterIndex = (index) => {
    const newRow = { description: '', '31-12-2021': '', '31-12-2022': '', '31-12-2024': '', variance: '', variance_percent: '' };
    const newRows = [...rows];
    newRows.splice(index + 1, 0, newRow);
    setRows(newRows);
  };

  const calculateVariance = (row) => {
    const value2024 = parseFloat(row['31-12-2024'] || 0);
    const value2022 = parseFloat(row['31-12-2022'] || 0);
    return isNaN(value2024) || isNaN(value2022) ? '' : (value2024 - value2022).toFixed(2);
  };

  const calculateVariancePercentage = (row) => {
    const variance = parseFloat(calculateVariance(row));
    const baseValue = parseFloat(row['31-12-2022'] || 0);
    if (isNaN(variance) || baseValue === 0) return '';
    return ((variance / baseValue) * 100).toFixed(1);
  };

  const isNonEditable = (description) => {
    return ['Revenue', 'Operating Expense', 'Other', 'Total Revenue', 'Total Operating Expense'].includes(description);
  };

  const isRevenueOrOperatingExpense = (description) => {
    return description !== 'Revenue' && description !== 'Operating Expense' && !['Accounting Standard', 'Audit Method', 'Display currency', 'Fx Rate'].includes(description);
  };

  const calculateTotal = (sectionStart, sectionEnd) => {
    return ['31-12-2021', '31-12-2022', '31-12-2024'].reduce((acc, year) => {
      const total = rows.slice(sectionStart + 1, sectionEnd).reduce((total, row) => {
        if (row.description !== '' && !isNonEditable(row.description) && !isNaN(parseFloat(row[year]))) {
          return total + parseFloat(row[year] || 0);
        }
        return total;
      }, 0);
      acc[year] = total.toFixed(2);
      return acc;
    }, {});
  };

  const getColor = (value) => {
    return value > 0 ? 'green' : value < 0 ? 'red' : 'black';
  };

  useEffect(() => {
    const revenueIndex = rows.findIndex(row => row.description === 'Revenue');
    const totalRevenueIndex = rows.findIndex(row => row.description === 'Total Revenue');
    const operatingExpenseIndex = rows.findIndex(row => row.description === 'Operating Expense');
    const totalOperatingExpenseIndex = rows.findIndex(row => row.description === 'Total Operating Expense');
  
    let newRows = [...rows];
  
    // Calculate totals for Revenue
    if (totalRevenueIndex !== -1 && revenueIndex !== -1) {
      const totalRevenue = calculateTotal(revenueIndex, totalRevenueIndex);
      newRows = newRows.map((row, index) =>
        index === totalRevenueIndex ? { ...row, ...totalRevenue } : row
      );
    }
  
    // Calculate totals for Operating Expenses
    if (totalOperatingExpenseIndex !== -1 && operatingExpenseIndex !== -1) {
      const totalOperatingExpense = calculateTotal(operatingExpenseIndex, totalOperatingExpenseIndex);
      newRows = newRows.map((row, index) =>
        index === totalOperatingExpenseIndex ? { ...row, ...totalOperatingExpense } : row
      );
    }
  
    // Update variance and variance percentage
    newRows = newRows.map((row, index) => {
      if (row.description === 'Total Revenue' || row.description === 'Total Operating Expense') {
        const previousRow = rows.find((r, i) => i === index - 1);
        // Update variance and percentage based on previous total row
        return {
          ...row,
          variance: previousRow ? calculateVariance({ ...previousRow, ...row }) : '',
          variance_percent: previousRow ? calculateVariancePercentage({ ...previousRow, ...row }) : ''
        };
      } else if (isRevenueOrOperatingExpense(row.description) && !isNaN(parseFloat(row['31-12-2022'])) && !isNaN(parseFloat(row['31-12-2024']))) {
        return {
          ...row,
          variance: calculateVariance(row),
          variance_percent: calculateVariancePercentage(row)
        };
      }
      // Clear variance and variance_percent for non-relevant rows
      return {
        ...row,
        variance: '',
        variance_percent: ''
      };
    });
  
    setRows(newRows);
  
  }, [rows]);

  return (
    <div className="table-container">
       <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'Profit & Loss' ? 'active' : ''}`}
          onClick={() => setActiveTab('Profit & Loss')}
        >
          Profit & Loss
        </button>
        <button
          className={`tab-button ${activeTab === 'Balance Sheet' ? 'active' : ''}`}
          onClick={() => setActiveTab('Balance Sheet')}
        >
          Balance Sheet
        </button>
        <button
          className={`tab-button ${activeTab === 'Cashflow' ? 'active' : ''}`}
          onClick={() => setActiveTab('Cashflow')}
        >
          Cashflow
        </button>
        <button
          className={`tab-button ${activeTab === 'Ratio' ? 'active' : ''}`}
          onClick={() => setActiveTab('Ratio')}
        >
          Ratio
        </button>
      </div>
      <table className="editable-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>31-12-2021</th>
            <th>31-12-2022</th>
            <th>31-12-2024</th>
            <th>Variance</th>
            <th>Variance %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
           <tr key={index} className={isNonEditable(row.description) ? 'bold-row' : ''}>

              <td>
                <input
                  type="text"
                  name="description"
                  value={row.description}
                  onChange={(event) => handleChange(index, 'description', event)}
                  disabled={isNonEditable(row.description)}
                />
                {row.description === 'Other' && (
                  <button onClick={() => addRowAfterIndex(index)} className="add-row-button">
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                )}
              </td>
              <td>
                <input
                  type="text"
                  name="31-12-2021"
                  value={row['31-12-2021']}
                  onChange={(event) => handleChange(index, '31-12-2021', event)}
                  disabled={isNonEditable(row.description)}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="31-12-2022"
                  value={row['31-12-2022']}
                  onChange={(event) => handleChange(index, '31-12-2022', event)}
                  disabled={isNonEditable(row.description)}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="31-12-2024"
                  value={row['31-12-2024']}
                  onChange={(event) => handleChange(index, '31-12-2024', event)}
                  disabled={isNonEditable(row.description)}
                />
              </td>
              <td style={{ color: getColor(row.variance) }}>
                {isRevenueOrOperatingExpense(row.description) && row.variance}
              </td>
              <td style={{ color: getColor(row.variance_percent) }}>
                {isRevenueOrOperatingExpense(row.description) && row.variance_percent && `${row.variance_percent}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditableTable;
