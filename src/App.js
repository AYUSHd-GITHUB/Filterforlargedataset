import React, { useEffect, useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import Papa from 'papaparse';
import Data from './dataset_large.csv';
import _ from 'lodash';
import './Style.css' ;

const App = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(Data);
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder('utf-8');
      const csvData = decoder.decode(result.value);
      const parsedData = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
      }).data;
      setData(parsedData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      setFilteredData(data); // Initially, set filteredData to all data
      setFilterOptions(getFilterOptions(data));
    }
  }, [data]);

  const columns = [
    {
      name: 'Number',
      selector: 'number',
    },
    {
      name: 'Modulo 350',
      selector: 'mod350',
    },
    {
      name: 'Modulo 8000',
      selector: 'mod8000',
    },
    {
      name: 'Modulo 20002',
      selector: 'mod20002',
    },
    
  ];

  const getFilterOptions = (data) => {
    const filterOptions = {};
    columns.forEach((column) => {
      const columnName = column.selector;
      const uniqueValues = [...new Set(data.map((item) => item[columnName]))];
      filterOptions[columnName] = uniqueValues;
    });
    return filterOptions;
  };

  const handleFilterChange = _.debounce((columnName, selectedValue) => {
    setFilteredData((prevData) =>
      prevData.filter((item) => item[columnName] === selectedValue)
    );
  }, 300);
  const handleClearFilters = () => {
    setFilteredData(data); // Reset filteredData to all data
  };

  return (
    <div>
      <h1>Filter For Large Dataset</h1>
      <FilterComponent filterOptions={filterOptions} onFilterChange={handleFilterChange} />
      <button className="clear-button" onClick={handleClearFilters}>
          Clear Filters
        </button>
      <TableComponent columns={columns} data={filteredData} />
    </div>
  );
};

const FilterComponent = ({ filterOptions, onFilterChange }) => {
  const handleFilterChange = (columnName, event) => {
    const selectedValue = event.target.value;
    onFilterChange(columnName, selectedValue);
  };

  return (
    <div>
      {Object.entries(filterOptions).map(([columnName, options]) => (
        <div key={columnName}>
          <h3>{columnName}</h3>
          <select onChange={(event) => handleFilterChange(columnName, event)}>
            <option value="">Select {columnName}...</option>
            {options.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

const TableComponent = ({ columns, data }) => {
  return (
    <DataTable
      columns={columns}
      data={data}
      pagination
      paginationPerPage={100}
      paginationRowsPerPageOptions={[100]}
      paginationComponentOptions={{ rowsPerPageText: 'Rows per page:' }}
      fixedHeader
    />
  );
};

export default App;
