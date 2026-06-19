import React from 'react';

const ModelSelector = ({ selectedModel, onModelChange }) => {
  return (
    <div className="model-selector">
      <label htmlFor="model-select">AI Model:</label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="model-dropdown"
      >
        <option value="claude">Claude (Anthropic)</option>
        <option value="chatgpt">ChatGPT (OpenAI)</option>
      </select>
    </div>
  );
};

export default ModelSelector;