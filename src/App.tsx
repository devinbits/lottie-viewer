import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, DeviceEventEmitter } from 'react-native';
import LottiePlayer, { type LottiePlayerRef } from './components/LottiePlayer';
import SettingsPanel from './components/SettingsPanel';
import ErrorBoundary from './components/ErrorBoundary';
import { openFilePicker } from './services/FilePickerService';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { getFileSize } from './services/FileSizeService';

interface AppProps {
  fileToOpen?: string;
}

function AppContent(props: AppProps): React.JSX.Element {
  const { colors } = useTheme();
  const [fileSource, setFileSource] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [speed, setSpeed] = useState<number>(1.0);
  const [autoplay, setAutoplay] = useState<boolean>(true);
  const [loop, setLoop] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const animationRef = useRef<LottiePlayerRef>(null);

  useEffect(() => {
    const handleFileOpen = async (filePath: string) => {
      if (filePath) {
        setFileSource(filePath);
        setSpeed(1.0);
        setAutoplay(true);
        setLoop(true);
        setProgress(0);
        setIsPlaying(true);
        // Get file size
        const size = await getFileSize(filePath);
        setFileSize(size);
      }
    };

    if (props.fileToOpen) {
      handleFileOpen(props.fileToOpen);
    }

    const subscription = DeviceEventEmitter.addListener('openFile', async (event) => {
      if (event.url) {
        await handleFileOpen(event.url);
      }
    });

    return () => subscription.remove();
  }, [props.fileToOpen]);

  const handleOpenFile = async () => {
    const filePath = await openFilePicker();
    if (filePath) {
      // Reset all controls to defaults when loading a new file
      setFileSource(filePath);
      setSpeed(1.0);
      setAutoplay(true);
      setLoop(true);
      setProgress(0);
      setIsPlaying(true);
      // Get file size
      const size = await getFileSize(filePath);
      setFileSize(size);
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
    // Pause animation when scrubbing
    if (animationRef.current && fileSource && isPlaying) {
      animationRef.current.pause();
      setIsPlaying(false);
    }
    setProgress(newProgress);
    // The progress prop will handle seeking in LottiePlayer
  };

  return (
    <ErrorBoundary>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
            fileSize={fileSize}
            onSpeedChange={setSpeed}
            onAutoplayToggle={setAutoplay}
            onLoopToggle={setLoop}
            onProgressChange={handleProgressChange}
            onPlay={handlePlay}
            onPause={handlePause}
            onReset={handleReset}
            onFilePickerPress={handleOpenFile}
          />
        </View>
      </View>
    </ErrorBoundary>
  );
}

function App(props: AppProps): React.JSX.Element {
  return (
    <ThemeProvider>
      <AppContent {...props} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

