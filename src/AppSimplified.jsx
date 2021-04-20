import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import DataTable from 'react-data-table-component';
const wholeFileRegex = /\r\n|\n/;
const rowRegex = /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/;
 
function App() {
    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);

    // process CSV data
    const processData = dataString => {
        const dataStringLines = dataString.split(wholeFileRegex);
        const dataStringLineOne = dataStringLines.shift();
        const headers = dataStringLineOne.split(rowRegex);
        const list = dataStringLines.reduce((accumulator, dataStringLine) => {
            const row = dataStringLine.split(rowRegex);
            if (headers && row.length == headers.length) {
                const obj = headers.reduce((acc, header, index) => {
                    let d = row[index];
                    if (header) {
                        acc[header] = d;
                    }
                    return acc;
                }, {});
                // remove the blank rows
                if (Object.values(obj).filter(x => x).length > 0) {
                    accumulator.push(obj);
                }
            }
            return accumulator;
        }, []);
        // prepare columns list from headers
        const columns = headers.map(c => ({ name: c, selector: c, }));
        setData(list);
        setColumns(columns);
    }
 
    // handle file upload
    const handleFileUpload = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
            /* Parse data */
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            /* Get first worksheet */
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            /* Convert array of arrays */
            const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
            const cleanedData = data.replace(/(")/g, '');
            processData(cleanedData);
        };
        reader.readAsBinaryString(file);
    }
 
    return (
        <div>
            <h3>Read CSV file in React - <a href="https://www.cluemediator.com" target="_blank" rel="noopener noreferrer">Clue Mediator</a></h3>
            <input onChange={handleFileUpload}
                accept=".csv,.xlsx,.xls"
                type="file" />
            <DataTable pagination
                columns={columns}
                highlightOnHover
                data={data} />
        </div>
    );
}
 
export default App;
