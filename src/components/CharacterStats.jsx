// src/components/CharacterStats.jsx
import React from 'react';
import HealthBar from './HealthBar';

const CharacterStats = ({ 
  name,
  health,
  maxHealth,
  shield,
  energy,
  maxEnergy,
  effects = [],
  className = ''
}) => {
  const getEffectIcon = (type) => {
    switch (type) {
      case 'strength': return '💪';
      case 'weakness': return '💔';
      case 'burn': return '🔥';
      case 'freeze': return '❄️';
      case 'poison': return '☠️';
      case 'blessing': return '✨';
      default: return '•';
    }
  };

  return (
    <div className={`flex flex-col p-4 bg-gray-800/60 rounded-lg ${className}`}>
      {/* Character name and health */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold">{name}</span>
        <span className="text-sm">
          {health}/{maxHealth} HP
        </span>
      </div>

      {/* Health and shield bars */}
      <HealthBar 
        currentHealth={health}
        maxHealth={maxHealth}
        shield={shield}
        className="mb-2"
      />

      {/* Energy display */}
      <div className="flex items-center mb-2">
        <span className="text-yellow-400 mr-2">⚡</span>
        <div className="flex gap-1">
          {Array.from({ length: maxEnergy }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded ${
                i < energy ? 'bg-yellow-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Active effects */}
      {effects.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {effects.map((effect, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-700/60 px-2 py-1 rounded"
              title={effect.description}
            >
              <span className="mr-1">{getEffectIcon(effect.type)}</span>
              {effect.duration > 0 && (
                <span className="text-sm">{effect.duration}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharacterStats;