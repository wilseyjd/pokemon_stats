from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load your data from pickle file
df_evolve = pd.read_pickle('pokemon_data.pkl')  # Update with your pickle file path


@app.route('/api/pokemon', methods=['GET'])
def get_all_pokemon():
    """Get list of all pokemon names"""
    pokemon_list = df_evolve['Name'].sort_values().tolist()
    return jsonify(pokemon_list)


@app.route('/api/pokemon/<name>', methods=['GET'])
def get_pokemon(name):
    """Get detailed data for a specific pokemon"""
    try:
        pokemon_data = df_evolve[df_evolve['Name'] == name].iloc[0]

        # Convert to dict and handle NaN values
        pokemon_dict = pokemon_data.to_dict()

        # Convert NaN to None for JSON serialization
        for key, value in pokemon_dict.items():
            if pd.isna(value):
                pokemon_dict[key] = None

        return jsonify(pokemon_dict)
    except IndexError:
        return jsonify({'error': 'Pokemon not found'}), 404


@app.route('/api/pokemon/<name>/stats', methods=['GET'])
def get_pokemon_stats(name):
    """Get stats data formatted for radar chart"""
    try:
        pokemon_data = df_evolve[df_evolve['Name'] == name].iloc[0]

        stats = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed']
        stat_cols = ['HP', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed']
        percentile_cols = [f'{col} Percentile' for col in stat_cols]

        stat_values = [float(pokemon_data[col]) for col in stat_cols]
        percentile_values = [float(pokemon_data[col]) for col in percentile_cols]

        return jsonify({
            'name': name,
            'stats': stats,
            'values': stat_values,
            'percentiles': percentile_values
        })
    except IndexError:
        return jsonify({'error': 'Pokemon not found'}), 404


@app.route('/api/pokemon/compare', methods=['POST'])
def compare_pokemon():
    """Compare two pokemon"""
    data = request.json
    name1 = data.get('pokemon1')
    name2 = data.get('pokemon2')

    try:
        pokemon_data1 = df_evolve[df_evolve['Name'] == name1].iloc[0]
        pokemon_data2 = df_evolve[df_evolve['Name'] == name2].iloc[0]

        stats = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed']
        stat_cols = ['HP', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed']
        percentile_cols = [f'{col} Percentile' for col in stat_cols]

        # Get weaknesses
        weakness_cols = [col for col in df_evolve.columns if col.startswith('Weak to ')]
        weaknesses1 = [col.replace('Weak to ', '') for col in weakness_cols if pokemon_data1[col] == True]
        weaknesses2 = [col.replace('Weak to ', '') for col in weakness_cols if pokemon_data2[col] == True]

        comparison = {
            'pokemon1': {
                'name': name1,
                'pokedex_number': int(pokemon_data1['Pokedex Number']),
                'type1': pokemon_data1['Type 1'],
                'type2': pokemon_data1['Type 2'] if pd.notna(pokemon_data1['Type 2']) else None,
                'image': pokemon_data1['Image'],
                'stats': [float(pokemon_data1[col]) for col in stat_cols],
                'percentiles': [float(pokemon_data1[col]) for col in percentile_cols],
                'evolve_from': pokemon_data1['Evolve From'] if pd.notna(pokemon_data1['Evolve From']) else None,
                'evolve_to': pokemon_data1['Evolve To'] if pd.notna(pokemon_data1['Evolve To']) else None,
                'base_evolution': pokemon_data1['Base Evolution'] if pd.notna(
                    pokemon_data1['Base Evolution']) else name1,
                'final_evolution': pokemon_data1['Final Evolution'] if pd.notna(
                    pokemon_data1['Final Evolution']) else name1,
                'weaknesses': weaknesses1[:6]
            },
            'pokemon2': {
                'name': name2,
                'pokedex_number': int(pokemon_data2['Pokedex Number']),
                'type1': pokemon_data2['Type 1'],
                'type2': pokemon_data2['Type 2'] if pd.notna(pokemon_data2['Type 2']) else None,
                'image': pokemon_data2['Image'],
                'stats': [float(pokemon_data2[col]) for col in stat_cols],
                'percentiles': [float(pokemon_data2[col]) for col in percentile_cols],
                'evolve_from': pokemon_data2['Evolve From'] if pd.notna(pokemon_data2['Evolve From']) else None,
                'evolve_to': pokemon_data2['Evolve To'] if pd.notna(pokemon_data2['Evolve To']) else None,
                'base_evolution': pokemon_data2['Base Evolution'] if pd.notna(
                    pokemon_data2['Base Evolution']) else name2,
                'final_evolution': pokemon_data2['Final Evolution'] if pd.notna(
                    pokemon_data2['Final Evolution']) else name2,
                'weaknesses': weaknesses2[:6]
            },
            'stat_labels': stats
        }

        return jsonify(comparison)
    except IndexError:
        return jsonify({'error': 'One or both pokemon not found'}), 404


@app.route('/api/pokemon/random', methods=['GET'])
def get_random_pokemon():
    """Get a random pokemon name"""
    random_pokemon = df_evolve['Name'].sample(1).iloc[0]
    return jsonify({'name': random_pokemon})


if __name__ == '__main__':
    app.run(debug=True, port=5000)