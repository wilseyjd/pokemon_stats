import React, { useState, useRef, useEffect } from 'react';

// Maps accent color to its focus ring rgba value
const FOCUS_SHADOW = {
  '#3498db': 'rgba(52,152,219,0.25)',
  '#e74c3c': 'rgba(231,76,60,0.2)',
};

/**
 * Searchable combobox for selecting a Pokemon from a large list.
 * Supports keyboard navigation (arrows, Enter, Escape) and click selection.
 */
function PokemonSelect({ id, value, options, onChange, label, accentColor = '#3498db' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
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
    setIsFocused(true);
    openDropdown();
  };

  // onBlur fires when the input loses focus. We use it to close the dropdown
  // UNLESS the user clicked an option (onMouseDown fires before onBlur and
  // calls e.preventDefault(), keeping focus in the input long enough for the
  // click to complete via the onMouseDown handler).
  const handleBlur = () => {
    setIsFocused(false);
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

  const borderStyle = { border: `2px solid ${accentColor}` };
  const focusStyle = isFocused
    ? { border: `2px solid ${accentColor}`, boxShadow: `0 0 0 3px ${FOCUS_SHADOW[accentColor] || 'rgba(52,152,219,0.25)'}` }
    : borderStyle;

  const optionClass = (name, idx) => [
    'py-[9px] px-[14px] cursor-pointer text-[15px] text-[#2c3e50]',
    name === value && idx === highlightedIndex ? 'bg-[#d6eaf8] font-bold text-[#2980b9]' :
    name === value ? 'font-bold text-[#2980b9]' :
    idx === highlightedIndex ? 'bg-[#eaf4fd]' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="relative inline-flex flex-col min-w-[200px]">
      {label && <label htmlFor={id} className="font-bold text-[#2c3e50] mb-1 text-[0.9em]">{label}</label>}
      <div className="relative flex items-center">
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
          className="w-full py-[10px] pl-[14px] pr-[36px] text-[15px] rounded-[5px] bg-white cursor-pointer box-border focus:outline-none focus:cursor-text"
          style={focusStyle}
          autoComplete="off"
          spellCheck={false}
          readOnly={!isOpen}
        />
        <span className="absolute right-[10px] text-[10px] text-[#7f8c8d] pointer-events-none" aria-hidden="true">
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {isOpen && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-label={label || 'Pokémon list'}
          ref={listRef}
          className="absolute top-[calc(100%+4px)] left-0 right-0 max-h-[260px] overflow-y-auto bg-white rounded-[5px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[100] list-none m-0 py-1"
          style={borderStyle}
        >
          {filtered.length === 0 ? (
            <li className="py-[10px] px-[14px] text-[#7f8c8d] italic">No Pokémon found</li>
          ) : (
            filtered.map((name, idx) => (
              <li
                key={`${name}-${idx}`}
                id={`${id}-option-${idx}`}
                role="option"
                aria-selected={name === value}
                className={optionClass(name, idx)}
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
