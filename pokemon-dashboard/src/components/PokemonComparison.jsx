import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import PokemonSelect from './PokemonSelect';
import './PokemonComparison.css';

const API_BASE_URL = 'http://localhost:5000/api';

function PokemonComparison() {
  const [allPokemon, setAllPokemon] = useState([]);
  const [pokemon1, setPokemon1] = useState('');
  const [pokemon2, setPokemon2] = useState('');
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all pokemon names on mount
  useEffect(() => {
    axios.get(`${API_BASE_URL}/pokemon`)
      .then(response => {
        setAllPokemon(response.data);
        if (response.data.length > 1) {
          setPokemon1(response.data[0]);
          setPokemon2(response.data[1]);
        }
      })
      .catch(() => setError('Could not load Pokémon list. Is the server running?'));
  }, []);

  // Load comparison when both pokemon are selected
  useEffect(() => {
    if (pokemon1 && pokemon2 && pokemon1 !== pokemon2) {
      loadComparison();
    }
  }, [pokemon1, pokemon2]);

  const loadComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/pokemon/compare`, {
        pokemon1,
        pokemon2
      });

      // Format data for radar chart
      const chartData = response.data.stat_labels.map((label, idx) => ({
        stat: label,
        [pokemon1]: response.data.pokemon1.percentiles[idx],
        [pokemon2]: response.data.pokemon2.percentiles[idx],
        value1: response.data.pokemon1.stats[idx],
        value2: response.data.pokemon2.stats[idx]
      }));

      // Store the names used to key chartData so rendering stays in sync
      // even when pokemon1/pokemon2 state updates before the next fetch completes
      setComparisonData({
        ...response.data,
        chartData,
        p1Name: pokemon1,
        p2Name: pokemon2,
      });
    } catch {
      setError(`Failed to load comparison. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomPokemon1 = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pokemon/random`);
      setPokemon1(response.data.name);
    } catch {
      setError('Could not fetch a random Pokémon. Please try again.');
    }
  };

  const handleRandomPokemon2 = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pokemon/random`);
      setPokemon2(response.data.name);
    } catch {
      setError('Could not fetch a random Pokémon. Please try again.');
    }
  };

  const handleSwap = () => {
    const temp = pokemon1;
    setPokemon1(pokemon2);
    setPokemon2(temp);
  };

  return (
    <div className="pokemon-comparison">
      <header className="comparison-header">
        <h1>Pokemon Comparison</h1>

        <div className="controls">
          <div className="pokemon-selector">
            <PokemonSelect
              id="pokemon1-select"
              label="Pokemon 1"
              value={pokemon1}
              options={allPokemon}
              onChange={setPokemon1}
              className="pokemon1-combobox"
            />
            <button onClick={handleRandomPokemon1} className="random-btn random-btn-1">
              Random
            </button>
          </div>

          {/* JEF-76: aria-label instead of title for screen reader support */}
          <button onClick={handleSwap} className="swap-btn" aria-label="Swap Pokémon">
            <span aria-hidden="true">⇄</span>
          </button>

          <div className="pokemon-selector">
            <PokemonSelect
              id="pokemon2-select"
              label="Pokemon 2"
              value={pokemon2}
              options={allPokemon}
              onChange={setPokemon2}
              className="pokemon2-combobox"
            />
            <button onClick={handleRandomPokemon2} className="random-btn random-btn-2">
              Random
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert">{error}</div>
      )}

      {loading && <div className="loading">Loading comparison...</div>}

      {!loading && pokemon1 && pokemon2 && pokemon1 === pokemon2 && (
        <div className="comparison-hint">
          Select two different Pokémon to compare.
        </div>
      )}

      {!loading && !error && comparisonData && (
        <div className="comparison-content">
          {/* Pokemon Headers with Images */}
          <div className="pokemon-headers">
            <div className="pokemon-card pokemon1-card">
              <h2>{comparisonData.pokemon1.name}</h2>
              <p className="pokedex-number">
                Pokedex #{String(comparisonData.pokemon1.pokedex_number).padStart(4, '0')}
              </p>
              <p className="pokemon-type">
                Type: {comparisonData.pokemon1.type1}
                {comparisonData.pokemon1.type2 && ` / ${comparisonData.pokemon1.type2}`}
              </p>
              <div className="pokemon-image">
                <img src={comparisonData.pokemon1.image} alt={comparisonData.pokemon1.name} />
              </div>
            </div>

            <div className="vs-divider">VS</div>

            <div className="pokemon-card pokemon2-card">
              <h2>{comparisonData.pokemon2.name}</h2>
              <p className="pokedex-number">
                Pokedex #{String(comparisonData.pokemon2.pokedex_number).padStart(4, '0')}
              </p>
              <p className="pokemon-type">
                Type: {comparisonData.pokemon2.type1}
                {comparisonData.pokemon2.type2 && ` / ${comparisonData.pokemon2.type2}`}
              </p>
              <div className="pokemon-image">
                <img src={comparisonData.pokemon2.image} alt={comparisonData.pokemon2.name} />
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="radar-section">
            <h3>Stats Comparison (Percentile)</h3>
            <ResponsiveContainer width="100%" height={500}>
              <RadarChart data={comparisonData.chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="stat" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name={comparisonData.p1Name}
                  dataKey={comparisonData.p1Name}
                  stroke="#e74c3c"
                  fill="#e74c3c"
                  fillOpacity={0.3}
                />
                <Radar
                  name={comparisonData.p2Name}
                  dataKey={comparisonData.p2Name}
                  stroke="#3498db"
                  fill="#3498db"
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Comparison Table */}
          <div className="stats-comparison-table">
            <h3>Detailed Stats Comparison</h3>
            <table>
              <thead>
                <tr>
                  <th>Stat</th>
                  <th className="pokemon1-col">{comparisonData.pokemon1.name}</th>
                  <th className="pokemon2-col">{comparisonData.pokemon2.name}</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.chartData.map((row, idx) => {
                  const diff = row.value1 - row.value2;
                  const percentileDiff = row[comparisonData.p1Name] - row[comparisonData.p2Name];
                  return (
                    <tr key={idx}>
                      <td><strong>{row.stat}</strong></td>
                      <td className="pokemon1-col">
                        {row.value1} ({row[comparisonData.p1Name].toFixed(1)}%)
                      </td>
                      <td className="pokemon2-col">
                        {row.value2} ({row[comparisonData.p2Name].toFixed(1)}%)
                      </td>
                      <td className={diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral'}>
                        {diff > 0 ? '+' : ''}{diff} ({percentileDiff > 0 ? '+' : ''}{percentileDiff.toFixed(1)}%)
                      </td>
                    </tr>
                  );
                })}
                <tr className="total-row">
                  <td><strong>Total</strong></td>
                  <td className="pokemon1-col">
                    <strong>
                      {comparisonData.pokemon1.stats.reduce((a, b) => a + b, 0)}
                    </strong>
                  </td>
                  <td className="pokemon2-col">
                    <strong>
                      {comparisonData.pokemon2.stats.reduce((a, b) => a + b, 0)}
                    </strong>
                  </td>
                  <td className={
                    comparisonData.pokemon1.stats.reduce((a, b) => a + b, 0) >
                    comparisonData.pokemon2.stats.reduce((a, b) => a + b, 0)
                      ? 'positive'
                      : 'negative'
                  }>
                    <strong>
                      {comparisonData.pokemon1.stats.reduce((a, b) => a + b, 0) -
                       comparisonData.pokemon2.stats.reduce((a, b) => a + b, 0)}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Evolution and Additional Info */}
          <div className="info-grid">
            <div className="info-card pokemon1-info">
              <h3>{comparisonData.pokemon1.name} - Evolution Chain</h3>
              <table>
                <tbody>
                  <tr>
                    <td><strong>Base Evolution:</strong></td>
                    <td>{comparisonData.pokemon1.base_evolution}</td>
                  </tr>
                  <tr>
                    <td><strong>Evolves From:</strong></td>
                    <td>{comparisonData.pokemon1.evolve_from || 'None'}</td>
                  </tr>
                  <tr>
                    <td><strong>Evolves To:</strong></td>
                    <td>{comparisonData.pokemon1.evolve_to || 'None'}</td>
                  </tr>
                  <tr>
                    <td><strong>Final Evolution:</strong></td>
                    <td>{comparisonData.pokemon1.final_evolution}</td>
                  </tr>
                  <tr>
                    <td><strong>Weaknesses:</strong></td>
                    <td>{comparisonData.pokemon1.weaknesses.join(', ') || 'None'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="info-card pokemon2-info">
              <h3>{comparisonData.pokemon2.name} - Evolution Chain</h3>
              <table>
                <tbody>
                  <tr>
                    <td><strong>Base Evolution:</strong></td>
                    <td>{comparisonData.pokemon2.base_evolution}</td>
                  </tr>
                  <tr>
                    <td><strong>Evolves From:</strong></td>
                    <td>{comparisonData.pokemon2.evolve_from || 'None'}</td>
                  </tr>
                  <tr>
                    <td><strong>Evolves To:</strong></td>
                    <td>{comparisonData.pokemon2.evolve_to || 'None'}</td>
                  </tr>
                  <tr>
                    <td><strong>Final Evolution:</strong></td>
                    <td>{comparisonData.pokemon2.final_evolution}</td>
                  </tr>
                  <tr>
                    <td><strong>Weaknesses:</strong></td>
                    <td>{comparisonData.pokemon2.weaknesses.join(', ') || 'None'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PokemonComparison;