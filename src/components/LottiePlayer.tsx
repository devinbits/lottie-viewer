import React, {useRef, useEffect, forwardRef, useImperativeHandle, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import type {LottiePlayerProps} from '../types';

export interface LottiePlayerRef {
  play: () => void;
  pause: () => void;
  reset: () => void;
  setProgress: (progress: number) => void;
}

const LottiePlayer = forwardRef<LottiePlayerRef, LottiePlayerProps>(({
  source,
  speed,
  autoplay,
  loop,
  progress,
}, ref) => {
  const animationRef = useRef<LottieView>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    play: () => {
      animationRef.current?.play();
    },
    pause: () => {
      animationRef.current?.pause();
    },
    reset: () => {
      animationRef.current?.reset();
    },
    setProgress: (prog: number) => {
      // Seek to specific progress position
      if (animationRef.current) {
        // Pause first, then set progress
        animationRef.current.pause();
        // The progress prop will handle the actual seeking
      }
    },
  }));

  // Track if we're manually scrubbing
  const isScrubbingRef = useRef<boolean>(false);
  const prevProgressRef = useRef<number>(progress);
  
  // Handle progress changes - seek to position when manually changed
  useEffect(() => {
    if (animationRef.current && source && progress !== undefined) {
      // Check if this is a manual progress change (large jump = scrubbing)
      const progressDiff = Math.abs(progress - prevProgressRef.current);
      const isManualChange = progressDiff > 0.05; // Threshold for manual scrubbing
      
      if (isManualChange) {
        // Manual scrub - pause and seek to position
        isScrubbingRef.current = true;
        animationRef.current.pause();
      } else {
        // Small changes indicate scrubbing has stopped or animation is playing normally
        isScrubbingRef.current = false;
      }
      
      prevProgressRef.current = progress;
    }
  }, [progress, source]);

  // Handle source changes - reset animation and clear errors
  useEffect(() => {
    if (source) {
      setLoadError(null); // Clear any previous errors when loading new file
      if (animationRef.current) {
        animationRef.current.reset();
        if (autoplay) {
          animationRef.current.play();
        }
      }
    }
  }, [source, autoplay]);

  // Handle autoplay changes
  useEffect(() => {
    if (animationRef.current && source) {
      if (autoplay) {
        animationRef.current.play();
      } else {
        animationRef.current.pause();
      }
    }
  }, [autoplay, source]);

  if (!source) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          No file selected{'\n'}Click "Open File" to select a .lottie file
        </Text>
      </View>
    );
  }

  // Show error message if loading failed
  if (loadError) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.errorTitle}>Failed to load animation</Text>
        <Text style={styles.errorText}>{loadError}</Text>
      </View>
    );
  }

  // Try different source formats for compatibility
  const getSource = () => {
    if (!source) return null;
    
    // If it's already a file:// URI, use it as is
    if (source.startsWith('file://')) {
      return {uri: source};
    }
    
    // Otherwise, try both formats
    // First try with file:// prefix
    return {uri: `file://${source}`};
  };

  const lottieSource = getSource();

  if (!lottieSource) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          No file selected{'\n'}Click "Open File" to select a .lottie file
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LottieView
        key={source} // Force re-render when source changes
        ref={animationRef}
        source={lottieSource}
        autoPlay={autoplay && !isScrubbingRef.current}
        loop={loop}
        speed={speed}
        progress={progress}
        style={styles.animation}
        resizeMode="contain"
        onAnimationFailure={(error) => {
          console.error('Lottie animation failed to load:', error);
          console.error('Source URI:', lottieSource.uri);
          // Extract error message
          const errorMessage = typeof error === 'string' 
            ? error 
            : error?.message || 'Unknown error occurred while loading the animation';
          setLoadError(errorMessage);
        }}
        onAnimationLoaded={() => {
          console.log('Lottie animation loaded successfully');
          setLoadError(null); // Clear any previous errors on successful load
        }}
        onAnimationLoop={() => {
          // Update progress when animation loops (if not scrubbing)
          if (!isScrubbingRef.current && animationRef.current) {
            // Progress will be managed by the animation itself
          }
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});

LottiePlayer.displayName = 'LottiePlayer';

export default LottiePlayer;

