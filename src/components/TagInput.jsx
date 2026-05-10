import { useState, useEffect, useRef } from 'react';
import ApiService from '../services/api';
import './TagInput.css';

const TagInput = ({ tags = [], onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [inputValueState, setInputValueState] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Load existing global tags for autocomplete
    const fetchTags = async () => {
      try {
        const response = await ApiService.getTags();
        setAllTags(response.data || []);
      } catch (err) {
        console.error('Failed to load tags for autocomplete', err);
      }
    };
    fetchTags();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValueState(value);

    if (value.trim()) {
      const filtered = allTags.filter(t => 
        t.name.toLowerCase().includes(value.toLowerCase()) && 
        !tags.includes(t.name)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const addTag = (tagName) => {
    const formattedTag = tagName.trim().toLowerCase();
    if (formattedTag && !tags.includes(formattedTag)) {
      onChange([...tags, formattedTag]);
    }
    setInputValueState('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValueState);
    } else if (e.key === 'Backspace' && !inputValueState && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="tag-input-container">
      <div className={`tag-input-wrapper ${isFocused ? 'focused' : ''}`}>
        <div className="selected-tags">
          {tags.map(tag => (
            <span key={tag} className="tag-pill">
              #{tag}
              <button 
                type="button" 
                className="remove-tag-btn" 
                onClick={() => removeTag(tag)}
              >
                &times;
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            className="tag-text-input"
            placeholder={tags.length === 0 ? "Add mood tags (e.g. dark, plot twist)..." : ""}
            value={inputValueState}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />
        </div>
      </div>
      
      {isFocused && suggestions.length > 0 && (
        <ul className="tag-suggestions">
          {suggestions.map(suggestion => (
            <li 
              key={suggestion.id}
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(suggestion.name);
              }}
            >
              #{suggestion.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagInput;
