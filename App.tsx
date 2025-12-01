import { TimerWidget } from './components/TimerWidget';
import { BackgroundLayer } from './components/BackgroundLayer';
import { ActionDock } from './components/ActionDock';
import { InstructionOverlay } from './components/InstructionOverlay';

function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/*
        This is a web app mimicking a desktop widget.
        In a real desktop environment, the background would be transparent.
        Here we use rotating eye-friendly HD wallpapers to demonstrate the glassmorphism.
      */}

      {/* 自动轮换的护眼高清背景图片 */}
      <BackgroundLayer interval={5 * 60 * 1000} />

      <InstructionOverlay />

      <TimerWidget />
      <ActionDock />
    </div>
  );
}

export default App;