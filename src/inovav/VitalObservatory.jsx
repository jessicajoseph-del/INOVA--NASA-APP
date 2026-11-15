import React from 'react';
import VitalObservatoryApp from './components/vital/VitalObservatoryApp';

export default function VitalObservatory({ astronaut, onClose, isEmbedded = false }) {
  return <VitalObservatoryApp astronaut={astronaut} onClose={onClose} isEmbedded={isEmbedded} />;
}
