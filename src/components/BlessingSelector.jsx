// src/components/BlessingSelector.jsx
import React, { useState } from 'react';
import BlessingCard from './BlessingCard';

const BlessingSelector = ({
  availableBlessings,
  activeBlessings,
  onBlessingSelect,
  className = ''
}) => {
  const [selectedBlessing, setSelectedBlessing] = useState(null);

  const handleBlessingClick = (blessing) => {
    setSelectedBlessing(blessing.id);
    onBlessingSelect(blessing);
  };

  const isBlessingActive = (blessingId) => {
    return activeBlessings.some(b => b.id === blessingId);
  };

  return (
    <div className={`p-4 ${className}`}>
      <h2 className="text-2xl font-bold mb-4">Choose a Blessing</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableBlessings.map(blessing => (
          <BlessingCard
            key={blessing.id}
            blessing={blessing}
            isSelected={selectedBlessing === blessing.id}
            isActive={isBlessingActive(blessing.id)}
            onClick={() => handleBlessingClick(blessing)}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-gray-400 text-sm">
        <p>Select a blessing to enhance your abilities.</p>
        <p>Only one blessing of each type can be active at a time.</p>
      </div>
    </div>
  );
};

export default BlessingSelector;