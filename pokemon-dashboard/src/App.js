import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import PokemonDashboard from './components/PokemonDashboard';
import PokemonComparison from './components/PokemonComparison';
import './App.css';

function App() {
  return (
    <div className="App">
      <nav className="main-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          Single Pokemon
        </NavLink>
        <NavLink to="/compare" className={({ isActive }) => isActive ? 'active' : ''}>
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
