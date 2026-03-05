import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import PokemonSelect from './PokemonSelect';
import { PokemonCardDisplay, TYPE_COLORS } from './PokemonCard';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function EvoLink({ name, onClick }) {
  if (!name) return <span>None</span>;
  return (
    <button
      className="bg-transparent border-0 p-0 text-[#3498db] cursor-pointer text-[inherit] font-[inherit] underline hover:text-[#2980b9]"
      onClick={() => onClick(name)}
    >
      {name}
    </button>
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const sectionHeadingClass = 'text-[#2c3e50] border-b-2 border-[#3498db] pb-[10px] mb-5';

  return (
    <div className="max-w-[1400px] mx-auto p-5 [font-family:'Arial',sans-serif]">
      <header className="text-center mb-[30px]">
        <h1 className="text-[#2c3e50] mb-5">Pokemon Dashboard</h1>

        <div className="flex gap-[15px] justify-center items-center">
          <PokemonSelect
            id="pokemon-select"
            value={selectedPokemon}
            options={allPokemon}
            onChange={setSelectedPokemon}
          />

          <button
            onClick={handleRandomPokemon}
            className="py-[10px] px-5 text-base bg-[#e74c3c] text-white border-0 rounded-[5px] cursor-pointer transition-colors duration-300 hover:bg-[#c0392b]"
          >
            Random Pokemon
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-[#fdecea] border border-[#e74c3c] rounded-[8px] text-[#c0392b] py-[14px] px-5 mb-5 text-base" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-[50px] text-[1.5em] text-[#7f8c8d]">Loading...</div>
      )}

      {!loading && !error && pokemonData && statsData && (
        <div className="bg-white rounded-[10px] shadow-[0_4px_6px_rgba(0,0,0,0.1)] p-[30px]">
          <div className="max-w-[360px] mx-auto mb-4">
            <PokemonCardDisplay
              pokemon={buildCardPokemon(pokemonData, statsData)}
              statLabels={statsData.map(s => s.stat)}
              accentColor={TYPE_COLORS[pokemonData['Type 1']] || '#3498db'}
              onEvoClick={setSelectedPokemon}
            />
          </div>

          <div className="grid grid-cols-[1.5fr_1fr] max-[968px]:grid-cols-1 gap-[30px] mt-[30px]">
            <div>
              <h3 className={sectionHeadingClass}>Stats (Percentile)</h3>
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

              <div className="mt-[30px]">
                <h4 className={sectionHeadingClass}>Detailed Stats</h4>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-[10px] text-left border-b border-[#ecf0f1] bg-[#3498db] text-white font-bold">Stat</th>
                      <th className="p-[10px] text-left border-b border-[#ecf0f1] bg-[#3498db] text-white font-bold">Value</th>
                      <th className="p-[10px] text-left border-b border-[#ecf0f1] bg-[#3498db] text-white font-bold">Percentile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsData.map((stat, idx) => (
                      <tr key={idx} className="hover:bg-[#f8f9fa]">
                        <td className="p-[10px] text-left border-b border-[#ecf0f1]">{stat.stat}</td>
                        <td className="p-[10px] text-left border-b border-[#ecf0f1]">{stat.value}</td>
                        <td className="p-[10px] text-left border-b border-[#ecf0f1]">{stat.percentile.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="bg-[#f8f9fa] p-5 rounded-[8px] mb-5">
                <h3 className={sectionHeadingClass}>Evolution Chain</h3>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="py-2 px-[5px]"><strong>Base Evolution:</strong></td>
                      <td className="py-2 px-[5px]"><EvoLink name={pokemonData['Base Evolution']} onClick={setSelectedPokemon} /></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-[5px]"><strong>Evolves From:</strong></td>
                      <td className="py-2 px-[5px]"><EvoLink name={pokemonData['Evolve From']} onClick={setSelectedPokemon} /></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-[5px]"><strong>Evolves To:</strong></td>
                      <td className="py-2 px-[5px]"><EvoLink name={pokemonData['Evolve To']} onClick={setSelectedPokemon} /></td>
                    </tr>
                    <tr>
                      <td className="py-2 px-[5px]"><strong>Final Evolution:</strong></td>
                      <td className="py-2 px-[5px]"><EvoLink name={pokemonData['Final Evolution']} onClick={setSelectedPokemon} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-[#f8f9fa] p-5 rounded-[8px] mb-5">
                <h3 className={sectionHeadingClass}>Additional Info</h3>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="py-2 px-[5px]"><strong>Total Stats:</strong></td>
                      <td className="py-2 px-[5px]">{statsData.reduce((sum, s) => sum + s.value, 0)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-[5px]"><strong>Avg Percentile:</strong></td>
                      <td className="py-2 px-[5px]">
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
