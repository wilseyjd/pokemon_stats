import React from 'react';
import './PokemonCard.css';

export const TYPE_COLORS = {
  Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0',
  Electric: '#F8D030', Grass: '#78C850', Ice: '#98D8D8',
  Fighting: '#C03028', Poison: '#A040A0', Ground: '#E0C068',
  Flying: '#A890F0', Psychic: '#F85888', Bug: '#A8B820',
  Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8',
  Dark: '#705848', Steel: '#B8B8D0', Fairy: '#EE99AC',
};

// Expected pokemon shape:
//   name, pokedex_number, type1, type2, image,
//   stats[],  percentiles[], evolve_from, weaknesses[]
export function PokemonCardDisplay({ pokemon, statLabels, accentColor, onEvoClick }) {
  const headerBg = TYPE_COLORS[pokemon.type1] || accentColor;
  return (
    <div className="pokemon-card" style={{ borderColor: accentColor }}>
      <div className="card-header" style={{ backgroundColor: headerBg }}>
        <div className="card-header-top">
          {pokemon.evolve_from
            ? <button className="evolution-link card-prev-evo" onClick={() => onEvoClick(pokemon.evolve_from)}>← {pokemon.evolve_from}</button>
            : <span />
          }
          <span className="card-hp">HP {pokemon.stats[0]}</span>
        </div>
        <h2 className="card-name">{pokemon.name}</h2>
        <p className="card-pokedex">#{String(pokemon.pokedex_number).padStart(4, '0')}</p>
      </div>

      <div className="card-image">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>

      <div className="card-types">
        {[pokemon.type1, pokemon.type2].filter(Boolean).map(type => (
          <span key={type} className="type-badge" style={{ backgroundColor: TYPE_COLORS[type] || '#888' }}>
            {type}
          </span>
        ))}
      </div>

      <div className="card-stats">
        {statLabels.map((label, i) => (
          <div key={label} className="stat-row">
            <span className="stat-label">{label}</span>
            <div className="stat-bar-wrap">
              <div className="stat-bar-fill" style={{ width: `${pokemon.percentiles[i]}%`, backgroundColor: accentColor }} />
            </div>
            <span className="stat-value">{pokemon.stats[i]}</span>
          </div>
        ))}
      </div>

      {pokemon.weaknesses.length > 0 && (
        <div className="card-weaknesses">
          <p className="weaknesses-label">Weak to:</p>
          <div className="weakness-badges">
            {pokemon.weaknesses.map(type => (
              <span key={type} className="type-badge" style={{ backgroundColor: TYPE_COLORS[type] || '#888' }}>
                {type}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
