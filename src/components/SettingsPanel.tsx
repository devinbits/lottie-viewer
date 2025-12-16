import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import type { SettingsPanelProps } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { formatFileSize } from '../services/FileSizeService';

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  speed,
  autoplay,
  loop,
  progress,
  isPlaying,
  fileSize,
  onSpeedChange,
  onAutoplayToggle,
  onLoopToggle,
  onProgressChange,
  onPlay,
  onPause,
  onReset,
  onFilePickerPress,
}) => {
  const { theme, toggleTheme, colors } = useTheme();
  const [speedTrackWidth, setSpeedTrackWidth] = useState(200);
  const [progressTrackWidth, setProgressTrackWidth] = useState(200);

  const handleSliderPress = (
    e: any,
    trackWidth: number,
    min: number,
    max: number,
    onChange: (value: number) => void
  ) => {
    const { locationX } = e.nativeEvent;
    const percentage = Math.max(0, Math.min(1, locationX / trackWidth));
    const value = min + percentage * (max - min);
    onChange(value);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderLeftColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Controls</Text>

      {/* Theme Toggle */}
      <View style={styles.controlGroup}>
        <View style={styles.toggleRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {theme === 'light' ? '☀️ Light' : '🌙 Dark'} Theme
          </Text>
          <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* File Picker Button */}
      <TouchableOpacity 
        style={[styles.filePickerButton, { backgroundColor: colors.primary }]} 
        onPress={onFilePickerPress}
      >
        <Text style={styles.filePickerButtonText}>🗂️ Open Lottie File</Text>
      </TouchableOpacity>

      {/* File Size Display */}
      {fileSize !== null && (
        <View style={styles.controlGroup}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            File Size: {formatFileSize(fileSize)}
          </Text>
        </View>
      )}

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Playback Speed */}
      <View style={styles.controlGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Playback Speed: {speed.toFixed(1)}x</Text>
        <View style={styles.sliderContainer}>
          <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>0.1x</Text>
          <TouchableOpacity
            style={[styles.sliderTrack, { backgroundColor: colors.border }]}
            onLayout={(e) => setSpeedTrackWidth(e.nativeEvent.layout.width)}
            onPress={(e) =>
              handleSliderPress(e, speedTrackWidth, 0.1, 3.0, (val) =>
                onSpeedChange(parseFloat(val.toFixed(1)))
              )
            }
            activeOpacity={1}>
            <View
              style={[
                styles.sliderFill,
                { width: `${((speed - 0.1) / 2.9) * 100}%`, backgroundColor: colors.primary },
              ]}
            />
            <View
              style={[
                styles.sliderThumb,
                { left: `${((speed - 0.1) / 2.9) * 100}%`, backgroundColor: colors.primary },
              ]}
            />
          </TouchableOpacity>
          <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>3.0x</Text>
        </View>
      </View>

      {/* Autoplay Toggle */}
      <View style={styles.controlGroup}>
        <View style={styles.toggleRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Autoplay</Text>
          <Switch value={autoplay} onValueChange={onAutoplayToggle} />
        </View>
      </View>

      {/* Loop Toggle */}
      <View style={styles.controlGroup}>
        <View style={styles.toggleRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Loop</Text>
          <Switch value={loop} onValueChange={onLoopToggle} />
        </View>
      </View>

      {/* Progress Scrubber */}
      <View style={styles.controlGroup}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Progress: {(progress * 100).toFixed(0)}%</Text>
        <View style={styles.sliderContainer}>
          <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>0%</Text>
          <TouchableOpacity
            style={[styles.sliderTrack, { backgroundColor: colors.border }]}
            onLayout={(e) => setProgressTrackWidth(e.nativeEvent.layout.width)}
            onPress={(e) =>
              handleSliderPress(e, progressTrackWidth, 0, 1, onProgressChange)
            }
            activeOpacity={1}>
            <View style={[styles.sliderFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
            <View
              style={[
                styles.sliderThumb,
                { left: `${Math.max(0, Math.min(100, progress * 100))}%`, backgroundColor: colors.primary },
              ]}
            />
          </TouchableOpacity>
          <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>100%</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Playback Controls */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: isPlaying ? colors.primaryDark : colors.primary }
          ]}
          onPress={isPlaying ? onPause : onPlay}
        >
          <Text style={styles.controlButtonText}>
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </Text>
        </TouchableOpacity>
        <View style={styles.buttonSpacer} />
        <TouchableOpacity 
          style={[styles.resetButton, { borderColor: colors.border }]} 
          onPress={onReset}
        >
          <Text style={[styles.resetButtonText, { color: colors.primary }]}>↻ Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    padding: 20,
    borderLeftWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
  },
  filePickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 1,
  },
  filePickerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginBottom: 24,
  },
  controlGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '500',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 8,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    marginTop: -5,
  },
  sliderLabel: {
    fontSize: 12,
    minWidth: 35,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  buttonGroup: {
    marginTop: 0,
  },
  buttonSpacer: {
    height: 12,
  },
  controlButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 1,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    lineHeight: 20,
  },
});

export default SettingsPanel;
