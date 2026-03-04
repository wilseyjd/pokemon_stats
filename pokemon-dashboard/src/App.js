import logo from './logo.svg';
import React, { useState } from 'react';
import PokemonDashboard from './components/PokemonDashboard';
import PokemonComparison from './components/PokemonComparison';
import './App.css';

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'comparison'

  return (
    <div className="App">
      <nav className="main-nav">
        <button
          className={view === 'dashboard' ? 'active' : ''}
          onClick={() => setView('dashboard')}
        >
          Single Pokemon
        </button>
        <button
          className={view === 'comparison' ? 'active' : ''}
          onClick={() => setView('comparison')}
        >
          Compare Pokemon
        </button>
      </nav>

      {view === 'dashboard' ? <PokemonDashboard /> : <PokemonComparison />}
    </div>
  );
}

export default App;