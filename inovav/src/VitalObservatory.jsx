import React from 'react';
import VitalObservatoryApp from './components/vital/VitalObservatoryApp';

export default function VitalObservatory({ astronaut, onClose }) {
  return <VitalObservatoryApp astronaut={astronaut} onClose={onClose} />;
}
