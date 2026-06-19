import React from 'react';

const ModelSelector = ({ selectedModel, onModelChange }) => {
  const getModelIcon = (model) => {
    return model === 'claude'
      ? '/logos/claude.svg'
      : '/logos/chatgpt.svg';
  };

  const getModelName = (model) => {
    return model === 'claude'
      ? 'Claude (Anthropic)'
      : 'ChatGPT (OpenAI)';
  };

  return (
    <div className="model-selector">
      <label htmlFor="model-select">AI Model:</label>
      <div className="model-dropdown-wrapper">
        <img
          src={getModelIcon(selectedModel)}
          alt={selectedModel}
          className="model-icon-selected"
        />
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
    </div>
  );
};

export default ModelSelector;