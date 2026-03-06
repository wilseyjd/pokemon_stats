import React from 'react';

export const TYPE_COLORS = {
  Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0',
  Electric: '#F8D030', Grass: '#78C850', Ice: '#98D8D8',
  Fighting: '#C03028', Poison: '#A040A0', Ground: '#E0C068',
  Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
  Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8',
  Dark: '#705848', Steel: '#B8B8D0', Fairy: '#EE99AC',
};

// Data stores types in ALL CAPS — normalize to title case for lookup
export function getTypeColor(type) {
  if (!type) return '#888';
  const titleCase = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  return TYPE_COLORS[titleCase] || '#888';
}

// Expected pokemon shape:
//   name, pokedex_number, type1, type2, image,
//   stats[],  percentiles[], evolve_from, weaknesses[]
export function PokemonCardDisplay({ pokemon, statLabels, accentColor, onEvoClick, className = '' }) {
  const headerBg = getTypeColor(pokemon.type1) !== '#888' ? getTypeColor(pokemon.type1) : accentColor;
  return (
    <div
      className={`rounded-[10px] overflow-hidden flex flex-col border-[3px] border-solid bg-pokemon-card-bg shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${className}`}
      style={{ borderColor: accentColor }}
    >
      <div
        className="pt-[12px] pb-[10px] px-[15px] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]"
        style={{ backgroundColor: headerBg }}
      >
        <div className="flex justify-between items-center mb-1">
          {pokemon.evolve_from
            ? <button
                className="bg-black/15 border-0 py-[2px] px-[6px] text-white/90 cursor-pointer text-[0.78em] font-[inherit] rounded-[4px] underline hover:text-pokemon-blue-dark"
                onClick={() => onEvoClick(pokemon.evolve_from)}
              >
                ← {pokemon.evolve_from}
              </button>
            : <span />
          }
          <span className="font-bold text-[0.9em]">HP {pokemon.stats[0]}</span>
        </div>
        <h2 className="text-[1.6em] mb-[2px] text-white">{pokemon.name}</h2>
        <p className="m-0 text-[0.8em] text-white/85">#{String(pokemon.pokedex_number).padStart(4, '0')}</p>
      </div>

      <div className="flex justify-center items-center p-[15px] bg-white/65 min-h-[170px]">
        <img
          className="w-[140px] h-[140px] object-contain"
          src={pokemon.image}
          alt={pokemon.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><rect width="140" height="140" rx="8" fill="%23ecf0f1"/><text x="70" y="65" text-anchor="middle" font-family="sans-serif" font-size="32">?</text><text x="70" y="90" text-anchor="middle" font-family="sans-serif" font-size="11" fill="%237f8c8d">No Image</text></svg>';
          }}
        />
      </div>

      <div className="flex gap-2 justify-center px-[15px] py-[10px] border-b border-[rgba(0,0,0,0.08)]">
        {[pokemon.type1, pokemon.type2].filter(Boolean).map(type => (
          <span
            key={type}
            className="text-white py-[3px] px-[10px] rounded-[12px] text-[0.78em] font-bold [text-shadow:0_1px_1px_rgba(0,0,0,0.2)] tracking-[0.03em]"
            style={{ backgroundColor: getTypeColor(type) }}
          >
            {type}
          </span>
        ))}
      </div>

      <div className="px-[15px] py-[12px] flex-1">
        {statLabels.map((label, i) => (
          <div key={label} className="grid grid-cols-[100px_1fr_38px] items-center gap-2 mb-[7px]">
            <span className="text-[0.75em] font-bold text-pokemon-dark-alt whitespace-nowrap">{label}</span>
            <div className="bg-pokemon-border rounded-[4px] h-2 overflow-hidden">
              <div
                className="h-full rounded-[4px] min-w-[2px]"
                style={{ width: `${pokemon.percentiles[i]}%`, backgroundColor: accentColor }}
              />
            </div>
            <span className="text-[0.78em] text-right text-pokemon-dark font-bold">{pokemon.stats[i]}</span>
          </div>
        ))}
      </div>

      {pokemon.weaknesses.length > 0 && (
        <div className="px-[15px] pt-[10px] pb-[14px] border-t border-[rgba(0,0,0,0.08)] mt-auto">
          <p className="text-[0.75em] font-bold text-pokemon-muted m-0 mb-[6px] uppercase tracking-[0.05em]">Weak to:</p>
          <div className="flex flex-wrap gap-[5px]">
            {pokemon.weaknesses.map(type => (
              <span
                key={type}
                className="text-white py-[3px] px-[10px] rounded-[12px] text-[0.78em] font-bold [text-shadow:0_1px_1px_rgba(0,0,0,0.2)] tracking-[0.03em]"
                style={{ backgroundColor: getTypeColor(type) }}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
