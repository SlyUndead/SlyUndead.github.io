// Dialog.js
import React from 'react';

const Dialog = ({ uniqueLabels, handleLabelChange, handleAddBox, handleCloseDialog, newBoxLabel }) => (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    border: '1px solid black'
  }}>
    <h2>Select a Label</h2>
    <select onChange={handleLabelChange} value={newBoxLabel}>
      <option value="">Select Label</option>
      {uniqueLabels.map(label => (
        <option key={label} value={label}>{label}</option>
      ))}
    </select>
    <button onClick={handleAddBox}>Add Box</button>
    <button onClick={handleCloseDialog}>Cancel</button>
  </div>
);

export default Dialog;
