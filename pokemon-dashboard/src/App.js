import React from 'react';
import { Routes, Route, NavLink, useSearchParams } from 'react-router-dom';
import PokemonDashboard from './components/PokemonDashboard';
import PokemonComparison from './components/PokemonComparison';
function App() {
  const [searchParams] = useSearchParams();

  // Carry the primary Pokemon across views when switching tabs
  const pokemon = searchParams.get('pokemon') || '';  // Dashboard param
  const p1 = searchParams.get('p1') || '';            // Comparison param

  const dashboardLink = p1 ? `/?pokemon=${encodeURIComponent(p1)}` : '/';
  const compareLink = pokemon ? `/compare?p1=${encodeURIComponent(pokemon)}` : '/compare';

  const navLinkClass = ({ isActive }) =>
    `py-[15px] px-[30px] text-lg font-bold rounded-[10px] cursor-pointer transition-all duration-300 shadow-md no-underline hover:-translate-y-[2px] hover:shadow-lg ${
      isActive
        ? 'bg-gradient-to-br from-[#3498db] to-[#2980b9] text-white'
        : 'bg-white text-[#2c3e50]'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4e2fc] to-[#d4e0f0] p-5">
      <nav className="flex justify-center gap-5 mb-[30px]">
        <NavLink to={dashboardLink} end className={navLinkClass}>
          Single Pokemon
        </NavLink>
        <NavLink to={compareLink} className={navLinkClass}>
          Compare Pokemon
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<PokemonDashboard />} />
        <Route path="/compare" element={<PokemonComparison />} />
      </Routes>
    </div>
  );
}

export default App;
