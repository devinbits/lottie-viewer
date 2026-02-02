export interface LottiePlayerProps {
  source: string | null;
  speed: number;
  autoplay: boolean;
  loop: boolean;
  progress: number;
  backgroundColor?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onReset?: () => void;
}

export interface SettingsPanelProps {
  speed: number;
  autoplay: boolean;
  loop: boolean;
  progress: number;
  isPlaying: boolean;
  fileSize?: number | null;
  isCustomColorEnabled: boolean;
  customBackgroundColor: string;
  onSpeedChange: (speed: number) => void;
  onAutoplayToggle: (autoplay: boolean) => void;
  onLoopToggle: (loop: boolean) => void;
  onProgressChange: (progress: number) => void;
  onCustomColorEnabledChange: (enabled: boolean) => void;
  onCustomBackgroundColorChange: (color: string) => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onFilePickerPress: () => void;
}

