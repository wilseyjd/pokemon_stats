import React, { useState, useRef, useEffect } from 'react';
import './PokemonSelect.css';

/**
 * Searchable combobox for selecting a Pokemon from a large list.
 * Supports keyboard navigation (arrows, Enter, Escape) and click selection.
 */
function PokemonSelect({ id, value, options, onChange, label, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listRef = useRef(null);

  const filtered = query
    ? options.filter(name => name.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Scroll highlighted item into view within the dropdown
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex];
    if (item) item.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  const openDropdown = () => {
    setIsOpen(true);
    setQuery('');
    setHighlightedIndex(-1);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    setQuery('');
    setHighlightedIndex(-1);
  };

  const selectOption = (name) => {
    onChange(name);
    closeDropdown();
  };

  const handleFocus = () => {
    openDropdown();
  };

  // onBlur fires when the input loses focus. We use it to close the dropdown
  // UNLESS the user clicked an option (onMouseDown fires before onBlur and
  // calls e.preventDefault(), keeping focus in the input long enough for the
  // click to complete via the onMouseDown handler).
  const handleBlur = () => {
    closeDropdown();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

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
        if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
          selectOption(filtered[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;
      default:
        break;
    }
  };

  // When open: show the query text the user is typing.
  // When closed: show the currently selected Pokemon name.
  const inputValue = isOpen ? query : (value || '');

  return (
    <div className={`pokemon-select-wrapper ${className}`}>
      {label && <label htmlFor={id} className="pokemon-select-label">{label}</label>}
      <div className="pokemon-select-control">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          aria-activedescendant={
            isOpen && highlightedIndex >= 0 && filtered[highlightedIndex]
              ? `${id}-option-${highlightedIndex}`
              : undefined
          }
          value={inputValue}
          placeholder={isOpen ? 'Search Pokémon…' : ''}
          onChange={e => {
            setQuery(e.target.value);
            setHighlightedIndex(e.target.value ? 0 : -1);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="pokemon-select-input"
          autoComplete="off"
          spellCheck={false}
          readOnly={!isOpen}
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
                key={`${name}-${idx}`}
                id={`${id}-option-${idx}`}
                role="option"
                aria-selected={name === value}
                className={[
                  'pokemon-select-option',
                  name === value ? 'selected' : '',
                  idx === highlightedIndex ? 'highlighted' : '',
                ].filter(Boolean).join(' ')}
                onMouseDown={(e) => {
                  // Prevent input blur so handleBlur doesn't fire before selection
                  e.preventDefault();
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
