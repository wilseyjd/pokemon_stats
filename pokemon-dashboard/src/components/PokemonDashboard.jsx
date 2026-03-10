import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import PokemonSelect from './PokemonSelect';
import { PokemonCardDisplay } from './PokemonCard';
import { COLORS } from '../colors';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function buildEvolutionChain(data) {
  const base = data['Base Evolution'];
  const evolveFrom = data['Evolve From'];
  const evolveTo = data['Evolve To'];
  const finalEvo = data['Final Evolution'];
  const name = data['Name'];

  const chain = [];
  if (base) chain.push(base);
  if (evolveFrom && !chain.includes(evolveFrom)) chain.push(evolveFrom);
  if (!chain.includes(name)) chain.push(name);
  if (evolveTo && !chain.includes(evolveTo)) chain.push(evolveTo);
  if (finalEvo && !chain.includes(finalEvo)) chain.push(finalEvo);
  return chain;
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
    total_stats: stats.reduce((sum, s) => sum + s.value, 0),
    evo_chain: buildEvolutionChain(data),
    weaknesses: Object.keys(data)
      .filter(k => k.startsWith('Weak to ') && data[k] === true)
      .map(k => k.replace('Weak to ', ''))
      .slice(0, 6),
  });

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex gap-[10px] items-center mb-5">
        <PokemonSelect
          id="pokemon-select"
          value={selectedPokemon}
          options={allPokemon}
          onChange={setSelectedPokemon}
        />
        <button
          onClick={handleRandomPokemon}
          className="py-[10px] px-5 text-base bg-pokemon-red text-white border-0 rounded-[5px] cursor-pointer transition-colors duration-300 hover:bg-pokemon-red-dark"
        >
          Random
        </button>
      </div>

      {error && (
        <div className="bg-pokemon-red-light border border-pokemon-red rounded-[8px] text-pokemon-red-dark py-[14px] px-5 mb-5 text-base" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-[50px] gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-pokemon-border border-t-pokemon-blue animate-spin" />
          <p className="text-pokemon-muted text-[1.1em] animate-pulse">Loading...</p>
        </div>
      )}

      {!loading && !error && pokemonData && statsData && (
        <div className="bg-white rounded-[10px] shadow-[0_4px_6px_rgba(0,0,0,0.1)] p-[30px]">
          <div className="flex gap-[30px] items-stretch max-[768px]:flex-col">
            <div className="w-[360px] shrink-0 max-[768px]:w-full max-[768px]:max-w-[360px] max-[768px]:mx-auto">
              <PokemonCardDisplay
                pokemon={buildCardPokemon(pokemonData, statsData)}
                statLabels={statsData.map(s => s.stat)}
                accentColor={COLORS.red}
                onEvoClick={setSelectedPokemon}
              />
            </div>

            <div className="flex-1 min-h-[540px] relative">
              <div className="absolute inset-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={statsData} outerRadius="75%">
                  <PolarGrid />
                  <PolarAngleAxis dataKey="stat" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Percentile"
                    dataKey="percentile"
                    stroke={COLORS.red}
                    fill={COLORS.red}
                    fillOpacity={0.5}
                  />
                  <Tooltip
                    formatter={(value, name, props) => [`${value.toFixed(1)}%`, props.payload.stat]}
                    contentStyle={{
                      backgroundColor: '#2c3e50',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.82rem',
                      padding: '6px 10px',
                    }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ display: 'none' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PokemonDashboard;
