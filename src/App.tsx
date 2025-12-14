import React, {useState, useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import LottiePlayer, {type LottiePlayerRef} from './components/LottiePlayer';
import SettingsPanel from './components/SettingsPanel';
import FilePickerButton from './components/FilePickerButton';
import ErrorBoundary from './components/ErrorBoundary';
import {openFilePicker} from './services/FilePickerService';

function App(): React.JSX.Element {
  const [fileSource, setFileSource] = useState<string | null>(null);
  const [speed, setSpeed] = useState<number>(1.0);
  const [autoplay, setAutoplay] = useState<boolean>(true);
  const [loop, setLoop] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const animationRef = useRef<LottiePlayerRef>(null);

  const handleOpenFile = async () => {
    const filePath = await openFilePicker();
    if (filePath) {
      setFileSource(filePath);
      setProgress(0);
      setIsPlaying(autoplay);
    }
  };

  const handlePlay = () => {
    if (animationRef.current && fileSource) {
      animationRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (animationRef.current && fileSource) {
      animationRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    if (animationRef.current && fileSource) {
      animationRef.current.reset();
      setProgress(0);
      setIsPlaying(false);
      if (autoplay) {
        setTimeout(() => {
          if (animationRef.current) {
            animationRef.current.play();
            setIsPlaying(true);
          }
        }, 100);
      }
    }
  };

  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    if (animationRef.current && fileSource) {
      animationRef.current.setProgress(newProgress);
    }
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <FilePickerButton onPress={handleOpenFile} />
        <View style={styles.content}>
          <View style={styles.previewArea}>
            <LottiePlayer
              ref={animationRef}
              source={fileSource}
              speed={speed}
              autoplay={autoplay}
              loop={loop}
              progress={progress}
            />
          </View>
          <SettingsPanel
            speed={speed}
            autoplay={autoplay}
            loop={loop}
            progress={progress}
            isPlaying={isPlaying}
            onSpeedChange={setSpeed}
            onAutoplayToggle={setAutoplay}
            onLoopToggle={setLoop}
            onProgressChange={handleProgressChange}
            onPlay={handlePlay}
            onPause={handlePause}
            onReset={handleReset}
          />
        </View>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  previewArea: {
    flex: 1,
  },
});

export default App;

