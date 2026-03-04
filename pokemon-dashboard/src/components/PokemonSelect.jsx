import React, { useState, useEffect, useRef } from 'react';
import './PokemonSelect.css';

/**
 * Searchable combobox for selecting a Pokemon from a large list.
 * Supports keyboard navigation (arrows, Enter, Escape) and mouse.
 */
function PokemonSelect({ id, value, options, onChange, label, className = '' }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const filtered = query.trim()
    ? options.filter(name => name.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Sync the input display when value changes externally (e.g. random button)
  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [value, isOpen]);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.children[highlightedIndex];
    if (item) item.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectOption = (name) => {
    onChange(name);
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  const handleInputClick = () => {
    setIsOpen(true);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(i => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[highlightedIndex]) selectOption(filtered[highlightedIndex]);
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery('');
        break;
      default:
        break;
    }
  };

  const displayValue = isOpen ? query : (value || '');

  return (
    <div className={`pokemon-select-wrapper ${className}`} ref={containerRef}>
      {label && <label htmlFor={id} className="pokemon-select-label">{label}</label>}
      <div className="pokemon-select-control">
        <input
          id={id}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          aria-activedescendant={isOpen && filtered[highlightedIndex] ? `${id}-option-${highlightedIndex}` : undefined}
          value={displayValue}
          placeholder={isOpen ? 'Search…' : ''}
          onChange={e => setQuery(e.target.value)}
          onClick={handleInputClick}
          onFocus={handleInputClick}
          onKeyDown={handleKeyDown}
          className="pokemon-select-input"
          autoComplete="off"
        />
        <span className="pokemon-select-arrow" aria-hidden="true">
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {isOpen && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-label={label || 'Pokémon list'}
          ref={listRef}
          className="pokemon-select-dropdown"
        >
          {filtered.length === 0 ? (
            <li className="pokemon-select-empty">No Pokémon found</li>
          ) : (
            filtered.map((name, idx) => (
              <li
                key={name}
                id={`${id}-option-${idx}`}
                role="option"
                aria-selected={name === value}
                className={[
                  'pokemon-select-option',
                  name === value ? 'selected' : '',
                  idx === highlightedIndex ? 'highlighted' : '',
                ].join(' ')}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent input blur before click registers
                  selectOption(name);
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                {name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default PokemonSelect;
