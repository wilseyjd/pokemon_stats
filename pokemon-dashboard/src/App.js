import React from 'react';
import { Routes, Route, NavLink, useSearchParams } from 'react-router-dom';
import PokemonDashboard from './components/PokemonDashboard';
import PokemonComparison from './components/PokemonComparison';
import './App.css';

function App() {
  const [searchParams] = useSearchParams();

  // Carry the primary Pokemon across views when switching tabs
  const pokemon = searchParams.get('pokemon') || '';  // Dashboard param
  const p1 = searchParams.get('p1') || '';            // Comparison param

  const dashboardLink = p1 ? `/?pokemon=${encodeURIComponent(p1)}` : '/';
  const compareLink = pokemon ? `/compare?p1=${encodeURIComponent(pokemon)}` : '/compare';

  return (
    <div className="App">
      <nav className="main-nav">
        <NavLink to={dashboardLink} end className={({ isActive }) => isActive ? 'active' : ''}>
          Single Pokemon
        </NavLink>
        <NavLink to={compareLink} className={({ isActive }) => isActive ? 'active' : ''}>
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
