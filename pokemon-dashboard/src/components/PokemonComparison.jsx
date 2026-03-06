import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import PokemonSelect from './PokemonSelect';
import { PokemonCardDisplay } from './PokemonCard';
import { COLORS } from '../colors';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const tdBase = 'p-3 text-left border-b border-pokemon-border';
const p1Col = `${tdBase} bg-pokemon-red/10`;
const p2Col = `${tdBase} bg-pokemon-blue/10`;

function PokemonComparison() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allPokemon, setAllPokemon] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pokemon1 = searchParams.get('p1') || '';
  const pokemon2 = searchParams.get('p2') || '';

  const setPokemon1 = (name) => {
    setSearchParams({ p1: name, p2: pokemon2 }, { replace: true });
  };

  const setPokemon2 = (name) => {
    setSearchParams({ p1: pokemon1, p2: name }, { replace: true });
  };

  // Load all pokemon names on mount; default p1/p2 if not in URL
  useEffect(() => {
    axios.get(`${API_BASE_URL}/pokemon`)
      .then(response => {
        setAllPokemon(response.data);
        if (response.data.length > 1) {
          const params = {};
          if (!searchParams.get('p1')) params.p1 = response.data[0];
          if (!searchParams.get('p2')) params.p2 = response.data[1];
          if (Object.keys(params).length) {
            setSearchParams(
              { p1: searchParams.get('p1') || response.data[0], p2: searchParams.get('p2') || response.data[1] },
              { replace: true }
            );
          }
        }
      })
      .catch(() => setError('Could not load Pokémon list. Is the server running?'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load comparison when both pokemon are selected
  useEffect(() => {
    if (pokemon1 && pokemon2 && pokemon1 !== pokemon2) {
      loadComparison();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setSearchParams({ p1: pokemon2, p2: pokemon1 }, { replace: true });
  };

  const randomBtnBase = 'py-[10px] px-5 text-sm text-white border-0 rounded-[5px] cursor-pointer transition-all duration-300';

  return (
    <div className="max-w-[1400px] mx-auto p-5">
      <header className="text-center mb-[30px]">
        <h1 className="text-pokemon-dark mb-[30px] text-[2.5em]">Pokemon Comparison</h1>

        <div className="flex gap-5 justify-center items-end flex-wrap max-[968px]:flex-col">
          <div className="flex gap-[10px] items-end">
            <PokemonSelect
              id="pokemon1-select"
              label="Pokemon 1"
              value={pokemon1}
              options={allPokemon}
              onChange={setPokemon1}
              accentColor={COLORS.red}
            />
            <button onClick={handleRandomPokemon1} className={`${randomBtnBase} bg-pokemon-red hover:bg-pokemon-red-dark`}>
              Random
            </button>
          </div>

          {/* JEF-76: aria-label instead of title for screen reader support */}
          <button
            onClick={handleSwap}
            className="py-[10px] px-5 text-[24px] bg-pokemon-neutral text-white border-0 rounded-full cursor-pointer transition-all duration-300 w-[50px] h-[50px] hover:bg-pokemon-muted hover:rotate-180"
            aria-label="Swap Pokémon"
          >
            <span aria-hidden="true">⇄</span>
          </button>

          <div className="flex gap-[10px] items-end">
            <PokemonSelect
              id="pokemon2-select"
              label="Pokemon 2"
              value={pokemon2}
              options={allPokemon}
              onChange={setPokemon2}
              accentColor={COLORS.blue}
            />
            <button onClick={handleRandomPokemon2} className={`${randomBtnBase} bg-pokemon-blue hover:bg-pokemon-blue-dark`}>
              Random
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-pokemon-red-light border border-pokemon-red rounded-[8px] text-pokemon-red-dark py-[14px] px-5 mb-5 text-base" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-[50px] gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-pokemon-border border-t-pokemon-blue animate-spin" />
          <p className="text-pokemon-muted text-[1.1em] animate-pulse">Loading comparison...</p>
        </div>
      )}

      {!loading && pokemon1 && pokemon2 && pokemon1 === pokemon2 && (
        <div className="text-center p-[40px] text-[1.1em] text-pokemon-muted bg-white rounded-[10px] shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
          Select two different Pokémon to compare.
        </div>
      )}

      {!loading && !error && comparisonData && (
        <div className="bg-white rounded-[10px] shadow-[0_4px_6px_rgba(0,0,0,0.1)] p-[30px]">
          {/* Pokemon Cards */}
          <div className="flex justify-between items-stretch mb-[40px] gap-[30px] max-[968px]:flex-col max-[968px]:items-stretch">
            <PokemonCardDisplay
              pokemon={comparisonData.pokemon1}
              statLabels={comparisonData.stat_labels}
              accentColor={COLORS.red}
              onEvoClick={setPokemon1}
              className="flex-1"
            />
            <div className="text-[3em] font-bold text-pokemon-neutral px-5 flex items-center max-[968px]:justify-center max-[968px]:py-5 max-[968px]:px-0">
              VS
            </div>
            <PokemonCardDisplay
              pokemon={comparisonData.pokemon2}
              statLabels={comparisonData.stat_labels}
              accentColor={COLORS.blue}
              onEvoClick={setPokemon2}
              className="flex-1"
            />
          </div>

          {/* Radar Chart */}
          <div className="my-[40px]">
            <h3 className="text-center text-pokemon-dark text-[1.8em] mb-5">Stats Comparison (Percentile)</h3>
            <ResponsiveContainer width="100%" height={500}>
              <RadarChart data={comparisonData.chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="stat" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name={comparisonData.p1Name}
                  dataKey={comparisonData.p1Name}
                  stroke={COLORS.red}
                  fill={COLORS.red}
                  fillOpacity={0.3}
                />
                <Radar
                  name={comparisonData.p2Name}
                  dataKey={comparisonData.p2Name}
                  stroke={COLORS.blue}
                  fill={COLORS.blue}
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Comparison Table */}
          <div className="my-[40px]">
            <h3 className="text-pokemon-dark text-[1.5em] mb-5 text-center">Detailed Stats Comparison</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={`${tdBase} bg-pokemon-dark-alt text-white font-bold`}>Stat</th>
                  <th className={`${p1Col} bg-pokemon-dark-alt text-white font-bold`}>{comparisonData.pokemon1.name}</th>
                  <th className={`${p2Col} bg-pokemon-dark-alt text-white font-bold`}>{comparisonData.pokemon2.name}</th>
                  <th className={`${tdBase} bg-pokemon-dark-alt text-white font-bold`}>Difference</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.chartData.map((row, idx) => {
                  const diff = row.value1 - row.value2;
                  const percentileDiff = row[comparisonData.p1Name] - row[comparisonData.p2Name];
                  const diffClass = diff > 0
                    ? `${tdBase} text-pokemon-green font-bold`
                    : diff < 0
                    ? `${tdBase} text-pokemon-red font-bold`
                    : `${tdBase} text-pokemon-neutral`;
                  const diffDisplay = diff > 0
                    ? `▲ +${diff} (+${percentileDiff.toFixed(1)}%)`
                    : diff < 0
                    ? `▼ ${diff} (${percentileDiff.toFixed(1)}%)`
                    : '= 0';
                  return (
                    <tr key={idx}>
                      <td className={tdBase}><strong>{row.stat}</strong></td>
                      <td className={p1Col}>{row.value1} ({row[comparisonData.p1Name].toFixed(1)}%)</td>
                      <td className={p2Col}>{row.value2} ({row[comparisonData.p2Name].toFixed(1)}%)</td>
                      <td className={diffClass}>{diffDisplay}</td>
                    </tr>
                  );
                })}
                {(() => {
                  const total1 = comparisonData.pokemon1.stats.reduce((a, b) => a + b, 0);
                  const total2 = comparisonData.pokemon2.stats.reduce((a, b) => a + b, 0);
                  const totalDiff = total1 - total2;
                  const totalDiffClass = totalDiff > 0 ? 'text-pokemon-green' : totalDiff < 0 ? 'text-pokemon-red' : 'text-pokemon-neutral';
                  const totalDiffDisplay = totalDiff > 0 ? `▲ +${totalDiff}` : totalDiff < 0 ? `▼ ${totalDiff}` : '= 0';
                  return (
                    <tr>
                      <td className={`${tdBase} bg-pokemon-border font-bold`}><strong>Total</strong></td>
                      <td className={`${p1Col} font-bold`}><strong>{total1}</strong></td>
                      <td className={`${p2Col} font-bold`}><strong>{total2}</strong></td>
                      <td className={`${tdBase} bg-pokemon-border font-bold ${totalDiffClass}`}><strong>{totalDiffDisplay}</strong></td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default PokemonComparison;
