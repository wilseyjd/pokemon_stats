import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getTypeColor, displayType } from './PokemonCard';

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const STAT_COLS = ['HP', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed', 'All-Around'];

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center py-[50px] gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-pokemon-border border-t-pokemon-blue animate-spin" />
    </div>
  );
}

function StatLeaderCard({ statName, entries, onPokemonClick }) {
  return (
    <div className="rounded-[10px] overflow-hidden border border-pokemon-border shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <div className="py-[10px] px-[14px] bg-gradient-to-br from-pokemon-blue to-pokemon-blue-dark text-white">
        <h3 className="m-0 text-[1em] font-bold">{statName}</h3>
      </div>
      <div className="bg-pokemon-card-bg">
        {entries.map((entry, i) => (
          <div
            key={entry.name}
            className="flex items-center gap-3 px-[14px] py-[8px] border-b border-pokemon-border last:border-b-0"
          >
            <span className="text-[0.78em] font-bold text-pokemon-muted w-4 shrink-0">{i + 1}</span>
            <button
              onClick={() => onPokemonClick(entry.name)}
              className="text-pokemon-blue font-bold text-[0.9em] cursor-pointer bg-transparent border-0 p-0 hover:underline text-left"
            >
              {entry.name}
            </button>
            <div className="flex gap-1 ml-auto shrink-0">
              {[entry.type1, entry.type2].filter(Boolean).map(type => (
                <span
                  key={type}
                  className="text-white py-[2px] px-[7px] rounded-[10px] text-[0.72em] font-bold"
                  style={{ backgroundColor: getTypeColor(type) }}
                >
                  {displayType(type)}
                </span>
              ))}
            </div>
            <span className="text-[0.85em] font-bold text-pokemon-dark shrink-0 w-8 text-right">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatLeaderGrid({ leaders, onPokemonClick }) {
  return (
    <div className="grid grid-cols-3 max-[1100px]:grid-cols-2 max-[680px]:grid-cols-1 gap-5">
      {STAT_COLS.map(stat => (
        <StatLeaderCard
          key={stat}
          statName={stat}
          entries={leaders[stat]}
          onPokemonClick={onPokemonClick}
        />
      ))}
    </div>
  );
}

export default function Explore() {
  const navigate = useNavigate();
  const [allTypes, setAllTypes] = useState([]);
  const [leaders, setLeaders] = useState(null);
  const [matchCount, setMatchCount] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [logic, setLogic] = useState('OR');
  const [excludeMega, setExcludeMega] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount: fetch type list
  useEffect(() => {
    axios.get(`${API_BASE}/explore`)
      .then(res => setAllTypes(res.data))
      .catch(() => setError('Could not load data. Is the server running?'));
  }, []);

  // Refetch leaders whenever filters change (including on mount)
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ logic, exclude_mega: excludeMega });
    if (selectedTypes.length > 0) params.set('types', selectedTypes.join(','));
    axios.get(`${API_BASE}/stats/leaders?${params}`)
      .then(res => {
        setLeaders(res.data.leaders);
        setMatchCount(res.data.count);
      })
      .catch(() => setError('Could not load data. Is the server running?'))
      .finally(() => setLoading(false));
  }, [selectedTypes, logic, excludeMega]);

  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const goToDashboard = (name) => navigate(`/?pokemon=${encodeURIComponent(name)}`);

  const filtersActive = selectedTypes.length > 0 || excludeMega;

  return (
    <div className="max-w-[1400px] mx-auto">
      <header className="mb-[24px]">
        <h1 className="text-[2em] font-bold text-pokemon-dark m-0 mb-1">Explore</h1>
        <p className="text-pokemon-muted m-0">Filter and rank Pokémon by type, stat, and more.</p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-[8px] px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Filter bar */}
      <section className="mb-[28px] p-[18px] bg-pokemon-card-bg rounded-[10px] border border-pokemon-border shadow-[0_2px_8px_rgba(0,0,0,0.07)]">

        {/* Type chips */}
        <div className="flex flex-wrap gap-2 mb-2">
          {allTypes.map(type => {
            const isSelected = selectedTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                style={isSelected
                  ? { backgroundColor: getTypeColor(type), color: '#fff', borderColor: getTypeColor(type) }
                  : { backgroundColor: '#fff', color: '#555', borderColor: getTypeColor(type) }
                }
                className="py-[4px] px-[14px] rounded-[14px] text-[0.82em] font-bold border-2 cursor-pointer transition-all"
              >
                {displayType(type)}
              </button>
            );
          })}
        </div>

        {/* AND/OR toggle — only when 2+ types selected */}
        {selectedTypes.length >= 2 && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-pokemon-muted text-sm font-bold">Match:</span>
            {['OR', 'AND'].map(opt => (
              <button
                key={opt}
                onClick={() => setLogic(opt)}
                className={`py-[3px] px-[12px] rounded-[10px] text-sm font-bold border-2 border-pokemon-blue cursor-pointer
                  ${logic === opt ? 'bg-pokemon-blue text-white' : 'bg-white text-pokemon-blue'}`}
              >
                {opt}
              </button>
            ))}
            <span className="text-pokemon-muted text-[0.82em] ml-1">
              {logic === 'AND' ? '(must have all selected types)' : '(any selected type)'}
            </span>
          </div>
        )}

        {/* Exclude Mega toggle + match count row */}
        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={() => setExcludeMega(prev => !prev)}
            className={`py-[3px] px-[12px] rounded-[10px] text-sm font-bold border-2 cursor-pointer transition-all
              ${excludeMega
                ? 'bg-pokemon-red border-pokemon-red text-white'
                : 'bg-white border-pokemon-border text-pokemon-muted'
              }`}
          >
            Exclude Mega
          </button>
          {matchCount !== null && (
            <span className="text-pokemon-muted text-sm">
              <span className="font-bold text-pokemon-dark">{matchCount}</span> Pokémon
              {filtersActive ? ' match' : ' total'}
            </span>
          )}
        </div>
      </section>

      {/* Leaders grid */}
      <section>
        <h2 className="text-[1.3em] font-bold text-pokemon-dark pb-[8px] mb-[18px] border-b-[3px] border-pokemon-red">
          {filtersActive ? 'Filtered Leaders' : 'All-Time Leaders'}
        </h2>
        {loading ? (
          <LoadingSpinner />
        ) : leaders ? (
          matchCount === 0 ? (
            <p className="text-pokemon-muted text-sm">No Pokémon match the selected filters.</p>
          ) : (
            <StatLeaderGrid leaders={leaders} onPokemonClick={goToDashboard} />
          )
        ) : null}
      </section>
    </div>
  );
}
