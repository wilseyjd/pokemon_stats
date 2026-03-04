import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import './PokemonDashboard.css';

const API_BASE_URL = 'http://localhost:5000/api';

function PokemonDashboard() {
  const [allPokemon, setAllPokemon] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState('');
  const [pokemonData, setPokemonData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load all pokemon names on mount
  useEffect(() => {
    axios.get(`${API_BASE_URL}/pokemon`)
      .then(response => {
        setAllPokemon(response.data);
        if (response.data.length > 0) {
          setSelectedPokemon(response.data[0]);
        }
      })
      .catch(error => console.error('Error loading pokemon list:', error));
  }, []);

  // Load selected pokemon data
  useEffect(() => {
    if (selectedPokemon) {
      loadPokemonData(selectedPokemon);
    }
  }, [selectedPokemon]);

  const loadPokemonData = async (name) => {
    setLoading(true);
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
    } catch (error) {
      console.error('Error loading pokemon data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomPokemon = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pokemon/random`);
      setSelectedPokemon(response.data.name);
    } catch (error) {
      console.error('Error getting random pokemon:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="pokemon-dashboard">
      <header className="dashboard-header">
        <h1>Pokemon Dashboard</h1>

        <div className="controls">
          <select
            value={selectedPokemon}
            onChange={(e) => setSelectedPokemon(e.target.value)}
            className="pokemon-select"
          >
            {allPokemon.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          <button onClick={handleRandomPokemon} className="random-btn">
            Random Pokemon
          </button>
        </div>
      </header>

      {pokemonData && (
        <div className="pokemon-details">
          <div className="pokemon-header">
            <h2>{pokemonData.Name}</h2>
            <p className="pokedex-number">Pokedex #{String(pokemonData['Pokedex Number']).padStart(4, '0')}</p>
            <p className="pokemon-type">
              Type: {pokemonData['Type 1']}
              {pokemonData['Type 2'] && ` / ${pokemonData['Type 2']}`}
            </p>
          </div>

          <div className="pokemon-image">
            <a href="https://pokemondb.net/pokedex/">
            <img src={pokemonData.Image} alt={pokemonData.Name} />
            </a>
          </div>

          <div className="content-grid">
            <div className="stats-section">
              <h3>Stats (Percentile)</h3>
              {statsData && (
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
              )}

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
                    {statsData && statsData.map((stat, idx) => (
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
                      <td>{pokemonData['Base Evolution'] || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td><strong>Evolves From:</strong></td>
                      <td>{pokemonData['Evolve From'] || 'None'}</td>
                    </tr>
                    <tr>
                      <td><strong>Evolves To:</strong></td>
                      <td>{pokemonData['Evolve To'] || 'None'}</td>
                    </tr>
                    <tr>
                      <td><strong>Final Evolution:</strong></td>
                      <td>{pokemonData['Final Evolution'] || 'N/A'}</td>
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
                      <td>{statsData && statsData.reduce((sum, s) => sum + s.value, 0)}</td>
                    </tr>
                    <tr>
                      <td><strong>Avg Percentile:</strong></td>
                      <td>
                        {statsData &&
                          (statsData.reduce((sum, s) => sum + s.percentile, 0) / statsData.length).toFixed(1)}%
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