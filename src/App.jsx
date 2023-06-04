import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import "./App.css";

const App = () => {
  const [parsedData, setParsedData] = useState(undefined);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const fileInfo = XLSX.read(data, { type: 'array' });

      const sheetName = fileInfo.SheetNames[0];
      const worksheet = fileInfo.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headers = jsonData[0];
      const parsedData = jsonData.slice(1).map((row) => {
        const rowData = {};
        row.forEach((cellData, index) => {
          const header = headers[index];
          rowData[header] = cellData;
        });
        return rowData;
      });

      setParsedData(parsedData);
    };

    reader.readAsArrayBuffer(file);
  };
  
  const jsonString = JSON.stringify(parsedData);

  const handleSaveJson = () => {
    // dispatch parsed Json on a POST request
    fetch('/api//save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: jsonString
    })
      .then((response) => response.json())
      .then((data) => {
        alert('Data saved successfully:', data);
      })
      .catch(() => {
        alert('Error saving data');
      });
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    alert('Data has been copied to clipboard!');
  };

  return (
    <div className="base-container">
      <span className="header">Excel File Data Parser</span>
      <label class="custom-file-upload">
        <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload}/>
        Choose File to Upload
      </label>
        <div className="json-display-container">
          {parsedData?.length && (
            <>
              <label>
                Parsed Details:
              </label>
              <textarea 
                value={jsonString} 
                cols="50" 
                rows="30" 
                className="json-display" 
                readOnly 
              />
              <div className="btn-section">
                <button onClick={handleSaveJson}>Save</button>
                <button onClick={handleCopyToClipboard}>Copy to Clipboard</button>
              </div>
            </>
          )}
        </div>
    </div>
  );
}

export default App;
