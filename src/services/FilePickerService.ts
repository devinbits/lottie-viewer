import {NativeModules} from 'react-native';

const {FilePickerModule} = NativeModules;

export const openFilePicker = async (): Promise<string | null> => {
  try {
    if (!FilePickerModule) {
      console.error('FilePickerModule is not available');
      return null;
    }
    
    const filePath = await FilePickerModule.openFilePicker();
    if (!filePath) {
      return null;
    }
    
    // Convert file path to file:// URI format for React Native
    // On macOS, absolute paths starting with / need file:/// (three slashes)
    let fileUri: string;
    if (filePath.startsWith('file://')) {
      fileUri = filePath;
    } else if (filePath.startsWith('/')) {
      // Absolute path - use file:/// (three slashes)
      fileUri = `file://${filePath}`;
    } else {
      // Relative path - use file:// (two slashes)
      fileUri = `file:///${filePath}`;
    }
    
    console.log('Selected file path:', filePath);
    console.log('File URI:', fileUri);
    
    return fileUri;
  } catch (err: any) {
    // User cancelled or error occurred
    if (err?.code === 'INVALID_FILE' || err?.code === 'NO_FILE') {
      console.warn('File picker:', err.message);
    } else {
      console.error('File picker error:', err);
    }
    return null;
  }
};

