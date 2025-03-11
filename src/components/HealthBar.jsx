// src/components/HealthBar.jsx
import React from 'react';

const HealthBar = ({ 
  currentHealth, 
  maxHealth, 
  shield = 0,
  className = '',
  size = 'medium'
}) => {
  const healthPercent = Math.max(0, Math.min(100, (currentHealth / maxHealth) * 100));
  const shieldPercent = Math.max(0, Math.min(100, (shield / maxHealth) * 100));

  // Determine health bar color based on percentage
  const getHealthColor = (percent) => {
    if (percent <= 25) return 'bg-red-600';
    if (percent <= 50) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const sizeClasses = {
    small: 'h-2',
    medium: 'h-4',
    large: 'h-6'
  };

  return (
    <div className={`relative w-full ${sizeClasses[size]} bg-gray-700 rounded overflow-hidden ${className}`}>
      {/* Base health bar */}
      <div
        className={`absolute left-0 top-0 h-full transition-all duration-300 ${getHealthColor(healthPercent)}`}
        style={{ width: `${healthPercent}%` }}
      />

      {/* Shield bar */}
      {shield > 0 && (
        <div
          className="absolute left-0 top-0 h-full bg-blue-400/50 transition-all duration-300"
          style={{ width: `${shieldPercent}%` }}
        />
      )}

      {/* Health text for medium and large sizes */}
      {size !== 'small' && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
          {currentHealth}/{maxHealth}
          {shield > 0 && ` (+${shield})`}
        </div>
      )}
    </div>
  );
};

export default HealthBar;