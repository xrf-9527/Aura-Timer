import React from 'react';
import { TimerWidget } from './components/TimerWidget';

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 
        This is a web app mimicking a desktop widget. 
        In a real desktop environment, the background would be transparent.
        Here we use a wallpaper to demonstrate the glassmorphism.
      */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Helper text for the user */}
        <div className="absolute top-8 left-8 text-white/40 font-sans text-sm max-w-xs">
          <p className="font-semibold mb-2">Aura Timer - macOS Replica</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Drag the widget anywhere.</li>
            <li>Click time to edit (or ask AI).</li>
            <li>Hover for controls.</li>
            <li>Space: Play/Pause | R: Reset</li>
          </ul>
        </div>
      </div>

      <TimerWidget />
    </div>
  );
}

export default App;