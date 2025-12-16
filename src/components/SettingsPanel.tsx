import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';
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
      {fileSize !== null && fileSize !== undefined && (
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
          <Slider
            containerStyle={styles.slider}
            minimumValue={0.1}
            maximumValue={3.0}
            value={speed}
            onValueChange={(values: number[]) => onSpeedChange(parseFloat(values[0].toFixed(1)))}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
            step={0.1}
            animationType="timing"
          />
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
          <Slider
            containerStyle={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={progress}
            onValueChange={(values: number[]) => onProgressChange(values[0])}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
            step={0.01}
            animationType="timing"
          />
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
            { backgroundColor: isPlaying ? colors.secondary : colors.primary }
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
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
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
