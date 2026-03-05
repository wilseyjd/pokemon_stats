import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import PokemonSelect from './PokemonSelect';
import { PokemonCardDisplay, TYPE_COLORS } from './PokemonCard';
import './PokemonDashboard.css';

const API_BASE_URL = 'http://localhost:5000/api';

function EvoLink({ name, onClick }) {
  if (!name) return <span>None</span>;
  return (
    <button className="evolution-link" onClick={() => onClick(name)}>{name}</button>
  );
}

function PokemonDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allPokemon, setAllPokemon] = useState([]);
  const [pokemonData, setPokemonData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedPokemon = searchParams.get('pokemon') || '';

  const setSelectedPokemon = (name) => {
    setSearchParams({ pokemon: name }, { replace: true });
  };

  // Load all pokemon names on mount; if no ?pokemon= param, default to first
  useEffect(() => {
    axios.get(`${API_BASE_URL}/pokemon`)
      .then(response => {
        setAllPokemon(response.data);
        if (!searchParams.get('pokemon') && response.data.length > 0) {
          setSearchParams({ pokemon: response.data[0] }, { replace: true });
        }
      })
      .catch(() => setError('Could not load Pokémon list. Is the server running?'));
  }, []);

  // Load selected pokemon data
  useEffect(() => {
    if (selectedPokemon) {
      loadPokemonData(selectedPokemon);
    }
  }, [selectedPokemon]);

  const loadPokemonData = async (name) => {
    setLoading(true);
    setError(null);
    try {
      const [dataResponse, statsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/pokemon/${name}`),
        axios.get(`${API_BASE_URL}/pokemon/${name}/stats`)
      ]);

      setPokemonData(dataResponse.data);

      // Format stats for recharts
      const formattedStats = statsResponse.data.stats.map((stat, idx) => ({
        stat: stat,
        value: statsResponse.data.values[idx],
        percentile: statsResponse.data.percentiles[idx]
      }));

      setStatsData(formattedStats);
    } catch {
      setError(`Failed to load data for ${name}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomPokemon = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pokemon/random`);
      setSelectedPokemon(response.data.name);
    } catch {
      setError('Could not fetch a random Pokémon. Please try again.');
    }
  };

  // Transform raw API data into the shape PokemonCardDisplay expects
  const buildCardPokemon = (data, stats) => ({
    name: data.Name,
    pokedex_number: data['Pokedex Number'],
    type1: data['Type 1'],
    type2: data['Type 2'],
    image: data.Image,
    stats: stats.map(s => s.value),
    percentiles: stats.map(s => s.percentile),
    evolve_from: data['Evolve From'],
    weaknesses: Object.keys(data)
      .filter(k => k.startsWith('Weak to ') && data[k] === true)
      .map(k => k.replace('Weak to ', ''))
      .slice(0, 6),
  });

  return (
    <div className="pokemon-dashboard">
      <header className="dashboard-header">
        <h1>Pokemon Dashboard</h1>

        <div className="controls">
          <PokemonSelect
            id="pokemon-select"
            value={selectedPokemon}
            options={allPokemon}
            onChange={setSelectedPokemon}
          />

          <button onClick={handleRandomPokemon} className="random-btn">
            Random Pokemon
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner" role="alert">{error}</div>
      )}

      {loading && <div className="loading">Loading...</div>}

      {!loading && !error && pokemonData && statsData && (
        <div className="pokemon-details">
          <div className="dashboard-card-wrap">
            <PokemonCardDisplay
              pokemon={buildCardPokemon(pokemonData, statsData)}
              statLabels={statsData.map(s => s.stat)}
              accentColor={TYPE_COLORS[pokemonData['Type 1']] || '#3498db'}
              onEvoClick={setSelectedPokemon}
            />
          </div>

          <div className="content-grid">
            <div className="stats-section">
              <h3>Stats (Percentile)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={statsData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="stat" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Percentile"
                    dataKey="percentile"
                    stroke="#4393c3"
                    fill="#4393c3"
                    fillOpacity={0.5}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>

              <div className="stats-table">
                <h4>Detailed Stats</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Stat</th>
                      <th>Value</th>
                      <th>Percentile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsData.map((stat, idx) => (
                      <tr key={idx}>
                        <td>{stat.stat}</td>
                        <td>{stat.value}</td>
                        <td>{stat.percentile.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="info-section">
              <div className="evolution-info">
                <h3>Evolution Chain</h3>
                <table>
                  <tbody>
                    <tr>
                      <td><strong>Base Evolution:</strong></td>
                      <td><EvoLink name={pokemonData['Base Evolution']} onClick={setSelectedPokemon} /></td>
                    </tr>
                    <tr>
                      <td><strong>Evolves From:</strong></td>
                      <td><EvoLink name={pokemonData['Evolve From']} onClick={setSelectedPokemon} /></td>
                    </tr>
                    <tr>
                      <td><strong>Evolves To:</strong></td>
                      <td><EvoLink name={pokemonData['Evolve To']} onClick={setSelectedPokemon} /></td>
                    </tr>
                    <tr>
                      <td><strong>Final Evolution:</strong></td>
                      <td><EvoLink name={pokemonData['Final Evolution']} onClick={setSelectedPokemon} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="additional-info">
                <h3>Additional Info</h3>
                <table>
                  <tbody>
                    <tr>
                      <td><strong>Total Stats:</strong></td>
                      <td>{statsData.reduce((sum, s) => sum + s.value, 0)}</td>
                    </tr>
                    <tr>
                      <td><strong>Avg Percentile:</strong></td>
                      <td>
                        {(statsData.reduce((sum, s) => sum + s.percentile, 0) / statsData.length).toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PokemonDashboard;
