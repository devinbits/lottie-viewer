import React from 'react';
import {View, Button, StyleSheet} from 'react-native';

interface FilePickerButtonProps {
  onPress: () => void;
}

const FilePickerButton: React.FC<FilePickerButtonProps> = ({onPress}) => {
  return (
    <View style={styles.container}>
      <Button title="Open File" onPress={onPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});

export default FilePickerButton;

