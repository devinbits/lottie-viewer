import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Button,
  TouchableOpacity,
} from 'react-native';
import type {SettingsPanelProps} from '../types';

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  speed,
  autoplay,
  loop,
  progress,
  isPlaying,
  onSpeedChange,
  onAutoplayToggle,
  onLoopToggle,
  onProgressChange,
  onPlay,
  onPause,
  onReset,
}) => {
  const [speedTrackWidth, setSpeedTrackWidth] = useState(200);
  const [progressTrackWidth, setProgressTrackWidth] = useState(200);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Controls</Text>

      {/* Playback Speed */}
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Playback Speed: {speed.toFixed(1)}x</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>0.1x</Text>
          <TouchableOpacity
            style={styles.sliderTrack}
            onLayout={(e) => setSpeedTrackWidth(e.nativeEvent.layout.width)}
            onPress={(e) => {
              const {locationX} = e.nativeEvent;
              const percentage = Math.max(0, Math.min(1, locationX / speedTrackWidth));
              const newSpeed = 0.1 + percentage * 2.9;
              onSpeedChange(parseFloat(newSpeed.toFixed(1)));
            }}
            activeOpacity={1}>
            <View
              style={[
                styles.sliderFill,
                {width: `${((speed - 0.1) / 2.9) * 100}%`},
              ]}
            />
            <View
              style={[
                styles.sliderThumb,
                {left: `${((speed - 0.1) / 2.9) * 100}%`},
              ]}
            />
          </TouchableOpacity>
          <Text style={styles.sliderLabel}>3.0x</Text>
        </View>
      </View>

      {/* Autoplay Toggle */}
      <View style={styles.controlGroup}>
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Autoplay</Text>
          <Switch value={autoplay} onValueChange={onAutoplayToggle} />
        </View>
      </View>

      {/* Loop Toggle */}
      <View style={styles.controlGroup}>
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Loop</Text>
          <Switch value={loop} onValueChange={onLoopToggle} />
        </View>
      </View>

      {/* Progress Scrubber */}
      <View style={styles.controlGroup}>
        <Text style={styles.label}>Progress: {(progress * 100).toFixed(0)}%</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>0%</Text>
          <TouchableOpacity
            style={styles.sliderTrack}
            onLayout={(e) => setProgressTrackWidth(e.nativeEvent.layout.width)}
            onPress={(e) => {
              const {locationX} = e.nativeEvent;
              const percentage = Math.max(0, Math.min(1, locationX / progressTrackWidth));
              onProgressChange(percentage);
            }}
            activeOpacity={1}>
            <View style={[styles.sliderFill, {width: `${progress * 100}%`}]} />
            <View style={[styles.sliderThumb, {left: `${progress * 100}%`}]} />
          </TouchableOpacity>
          <Text style={styles.sliderLabel}>100%</Text>
        </View>
      </View>

      {/* Playback Controls */}
      <View style={styles.buttonGroup}>
        <Button
          title={isPlaying ? 'Pause' : 'Play'}
          onPress={isPlaying ? onPause : onPlay}
        />
        <View style={styles.buttonSpacer} />
        <Button title="Reset" onPress={onReset} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    padding: 20,
    backgroundColor: '#fafafa',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  controlGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
    color: '#4a4a4a',
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
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginHorizontal: 8,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    marginLeft: -8,
    marginTop: -5,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
    minWidth: 35,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  buttonGroup: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonSpacer: {
    height: 12,
  },
});

export default SettingsPanel;

