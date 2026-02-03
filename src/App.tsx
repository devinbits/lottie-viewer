import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, DeviceEventEmitter } from 'react-native';
import LottiePlayer, { type LottiePlayerRef } from './components/LottiePlayer';
import SettingsPanel from './components/SettingsPanel';
import FilePanel from './components/FilePanel';
import ErrorBoundary from './components/ErrorBoundary';
import { openFilePicker } from './services/FilePickerService';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { getFileSize } from './services/FileSizeService';
import type { FileInfo } from './types';

interface AppProps {
  fileToOpen?: string;
}

function AppContent(props: AppProps): React.JSX.Element {
  const { colors } = useTheme();
  // Multi-file state
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Player state
  // const [fileSize, setFileSize] = useState<number | null>(null); // Removed locally as we use file info
  const [speed, setSpeed] = useState<number>(1.0); // Start with 1.0 speed
  const [autoplay, setAutoplay] = useState<boolean>(true);
  const [loop, setLoop] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [customBackgroundColor, setCustomBackgroundColor] = useState<string>('#ffffff');
  const [isCustomColorEnabled, setIsCustomColorEnabled] = useState<boolean>(false);
  const animationRef = useRef<LottiePlayerRef>(null);

  useEffect(() => {
    const handleFileOpen = async (filePath: string) => {
      if (filePath) {
        const size = await getFileSize(filePath);
        
        // Add to files list if not present
        setFiles(prev => {
          if (!prev.some(f => f.uri === filePath)) {
            return [...prev, { uri: filePath, size }];
          }
          return prev;
        });
        setSelectedFile(filePath);
        
        // Reset controls
        setSpeed(1.0);
        setAutoplay(true);
        setLoop(true);
        setProgress(0);
        setIsPlaying(true);
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

  const handleAddFile = async () => {
    const filePath = await openFilePicker();
    if (filePath) {
      const size = await getFileSize(filePath);

      // Add to files list if not present
      setFiles(prev => {
        if (!prev.some(f => f.uri === filePath)) {
          return [...prev, { uri: filePath, size }];
        }
        return prev;
      });
      setSelectedFile(filePath);

      // Reset all controls to defaults when loading a new file
      setSpeed(1.0);
      setAutoplay(true);
      setLoop(true);
      setProgress(0);
      setIsPlaying(true);
    }
  };

  const handleSelectFile = async (filePath: string) => {
    setSelectedFile(filePath);
    // Reset controls or keep them? Usually switching files resets state unless we want persistence per file.
    // Let's reset for now to be safe and consistent with "opening" a file behavior.
    setSpeed(1.0);
    setAutoplay(true);
    setLoop(true);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleRemoveFile = (fileUri: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.uri !== fileUri);
      
      // If we removed the selected file, select another one or clear selection
      if (selectedFile === fileUri) {
        if (newFiles.length > 0) {
          // Select the first available file (or maybe the one adjacent? first is simplest)
          handleSelectFile(newFiles[0].uri);
        } else {
          // No files left
          setSelectedFile(null);
          setIsPlaying(false);
          setProgress(0);
          if (animationRef.current) {
             // Optional: reset player source if needed, but passing null source usually works
          }
        }
      }
      return newFiles;
    });
  };

  const handlePlay = () => {
    if (animationRef.current && selectedFile) {
      animationRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (animationRef.current && selectedFile) {
      animationRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    if (animationRef.current && selectedFile) {
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
    if (animationRef.current && selectedFile && isPlaying) {
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
            <View style={styles.playerContainer}>
              <LottiePlayer
                ref={animationRef}
                source={selectedFile}
                speed={speed}
                autoplay={autoplay}
                loop={loop}
                progress={progress}
                backgroundColor={isCustomColorEnabled ? customBackgroundColor : colors.surface}
              />
            </View>
            <FilePanel
              files={files}
              selectedFile={selectedFile}
              onFileSelect={handleSelectFile}
              onAddFile={handleAddFile}
              onRemoveFile={handleRemoveFile}
              colors={colors}
            />
          </View>
          <SettingsPanel
            speed={speed}
            autoplay={autoplay}
            loop={loop}
            progress={progress}
            isPlaying={isPlaying}
            isCustomColorEnabled={isCustomColorEnabled}
            customBackgroundColor={customBackgroundColor}
            onSpeedChange={setSpeed}
            onAutoplayToggle={setAutoplay}
            onLoopToggle={setLoop}
            onProgressChange={handleProgressChange}
            onCustomColorEnabledChange={setIsCustomColorEnabled}
            onCustomBackgroundColorChange={setCustomBackgroundColor}
            onPlay={handlePlay}
            onPause={handlePause}
            onReset={handleReset}
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
    flexDirection: 'column',
  },
  playerContainer: {
    flex: 1,
    width: '100%',
  },
});

export default App;

