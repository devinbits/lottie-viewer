import React, {useRef, useEffect, forwardRef, useImperativeHandle} from 'react';
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
      // Progress is controlled via props, but we can reset and play from this point
      if (animationRef.current) {
        animationRef.current.reset();
        // Note: We'll need to handle progress updates via props
      }
    },
  }));

  // Handle progress changes - reset and seek to position
  useEffect(() => {
    if (animationRef.current && source && progress !== undefined) {
      // Reset and play from the progress point
      animationRef.current.reset();
      // Progress is handled via the progress prop on LottieView
    }
  }, [progress, source]);

  // Handle source changes - reset animation
  useEffect(() => {
    if (animationRef.current && source) {
      animationRef.current.reset();
      if (autoplay) {
        animationRef.current.play();
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
        autoPlay={autoplay}
        loop={loop}
        speed={speed}
        progress={progress}
        style={styles.animation}
        resizeMode="contain"
        onAnimationFailure={(error) => {
          console.error('Lottie animation failed to load:', error);
          console.error('Source URI:', lottieSource.uri);
        }}
        onAnimationLoad={() => {
          console.log('Lottie animation loaded successfully');
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
});

LottiePlayer.displayName = 'LottiePlayer';

export default LottiePlayer;

