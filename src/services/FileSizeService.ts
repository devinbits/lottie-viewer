import { NativeModules, Platform } from 'react-native';

const { FilePickerModule } = NativeModules;

export const getFileSize = async (filePath: string): Promise<number | null> => {
  try {
    if (!filePath) {
      return null;
    }

    // Remove file:// prefix if present
    let cleanPath = filePath;
    if (filePath.startsWith('file://')) {
      cleanPath = filePath.replace('file://', '');
    }

    // On macOS, use the native module to get file size
    if (Platform.OS === 'macos' && FilePickerModule) {
      try {
        const size = await FilePickerModule.getFileSize(cleanPath);
        return size;
      } catch (error) {
        console.error('Error getting file size from native module:', error);
        // Fall through to try other methods
      }
    }

    // Fallback: try to use Node.js fs if available (for development/testing)
    // This won't work in production React Native, but we'll handle it gracefully
    if (typeof require !== 'undefined') {
      try {
        const fs = require('fs');
        const stats = fs.statSync(cleanPath);
        return stats.size;
      } catch (e) {
        // fs not available, continue to return null
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting file size:', error);
    return null;
  }
};

export const formatFileSize = (bytes: number | null): string => {
  if (bytes === null || bytes === undefined) {
    return 'Unknown';
  }

  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};
