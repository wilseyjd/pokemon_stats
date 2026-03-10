import React from 'react';
import { Routes, Route, NavLink, useSearchParams } from 'react-router-dom';
import PokemonDashboard from './components/PokemonDashboard';
import PokemonComparison from './components/PokemonComparison';
import Explore from './components/Explore';

function App() {
  const [searchParams] = useSearchParams();

  // Carry the primary Pokemon across views when switching tabs
  const pokemon = searchParams.get('pokemon') || '';  // Dashboard param
  const p1 = searchParams.get('p1') || '';            // Comparison param

  const dashboardLink = p1 ? `/?pokemon=${encodeURIComponent(p1)}` : '/';
  const compareLink = pokemon ? `/compare?p1=${encodeURIComponent(pokemon)}` : '/compare';

  const navLinkClass = ({ isActive }) =>
    `flex items-center h-full px-5 text-sm font-semibold border-b-2 transition-colors duration-200 no-underline ${
      isActive
        ? 'text-white border-white'
        : 'text-white/60 border-transparent hover:text-white/90 hover:border-white/40'
    }`;

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col">
      <header className="bg-pokemon-dark border-b border-black/20 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-5 h-14 flex items-stretch justify-between">
          <span className="flex items-center text-white font-bold text-lg tracking-tight">
            Pokémon Stats
          </span>
          <nav className="flex items-stretch gap-0">
            <NavLink to={dashboardLink} end className={navLinkClass}>
              Single Pokémon
            </NavLink>
            <NavLink to={compareLink} className={navLinkClass}>
              Compare
            </NavLink>
            <NavLink to="/explore" className={navLinkClass}>
              Explore
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 p-5">
        <Routes>
          <Route path="/" element={<PokemonDashboard />} />
          <Route path="/compare" element={<PokemonComparison />} />
          <Route path="/explore" element={<Explore />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
