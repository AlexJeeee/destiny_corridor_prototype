// src/components/Character.jsx
import React from 'react';

const Character = ({ unit }) => {
  // Calculate health percentage for the health bar
  const healthPercentage = Math.max(0, Math.min(100, (unit.health / unit.maxHealth) * 100));
  
  // Calculate shield percentage if shield exists
  const shieldPercentage = unit.shield ? Math.min(100, (unit.shield / unit.maxHealth) * 100) : 0;
  
  // Determine health bar color based on percentage
  const getHealthColor = (percent) => {
    if (percent <= 25) return 'bg-red-500';
    if (percent <= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="character relative p-4 bg-gray-800/60 rounded-lg">
      {/* Character name and basic stats */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-bold">{unit.name}</span>
        <span className="text-sm">
          {unit.health}/{unit.maxHealth} HP
          {unit.shield > 0 && ` (+${unit.shield})`}
        </span>
      </div>

      {/* Health and shield bars */}
      <div className="relative h-4 bg-gray-700 rounded overflow-hidden">
        {/* Main health bar */}
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-300 ${getHealthColor(healthPercentage)}`}
          style={{ width: `${healthPercentage}%` }}
        />
        
        {/* Shield overlay */}
        {shieldPercentage > 0 && (
          <div
            className="absolute left-0 top-0 h-full bg-blue-400/50 transition-all duration-300"
            style={{ width: `${shieldPercentage}%` }}
          />
        )}
      </div>

      {/* Status effects */}
      {unit.effects && unit.effects.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {unit.effects.map((effect, index) => (
            <div
              key={index}
              className="px-2 py-1 text-sm bg-gray-700/60 rounded"
              title={`${effect.type} - ${effect.duration} turns remaining`}
            >
              {effect.type === 'strength' && '💪'}
              {effect.type === 'defense_up' && '🛡️'}
              {effect.type === 'burn' && '🔥'}
              {effect.type === 'freeze' && '❄️'}
              {effect.duration > 0 && <span className="ml-1">{effect.duration}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Combat stats if they exist */}
      {(unit.attack !== 1 || unit.defense > 0) && (
        <div className="flex gap-4 mt-2 text-sm">
          {unit.attack !== 1 && (
            <span className="text-red-400">
              ATK {unit.attack > 1 ? '+' : ''}{Math.round((unit.attack - 1) * 100)}%
            </span>
          )}
          {unit.defense > 0 && (
            <span className="text-blue-400">
              DEF +{unit.defense}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Character;