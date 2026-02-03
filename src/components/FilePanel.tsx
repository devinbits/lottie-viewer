import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import { ThemeContextType } from '../contexts/ThemeContext';

import { formatFileSize } from '../services/FileSizeService';
import type { FileInfo } from '../types';

interface FilePanelProps {
  files: FileInfo[];
  selectedFile: string | null;
  onFileSelect: (file: string) => void;
  onAddFile: () => void;
  onRemoveFile: (file: string) => void;
  colors: ThemeContextType['colors'];
}

const FilePanel: React.FC<FilePanelProps> = ({
  files,
  selectedFile,
  onFileSelect,
  onAddFile,
  onRemoveFile,
  colors,
}) => {
  const getFileName = (uri: string) => {
    try {
      const parts = uri.split('/');
      return parts.pop() || 'Unknown File';
    } catch (e) {
      return 'Unknown File';
    }
  };

  const renderItem: ListRenderItem<FileInfo> = ({ item }) => {
    const isSelected = item.uri === selectedFile;
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={[
            styles.fileItem,
            {
              backgroundColor: isSelected ? colors.primaryDark : colors.surface,
              borderColor: colors.border,
            },
          ]}
          onPress={() => onFileSelect(item.uri)}
        >
          <View style={styles.fileInfo}>
            <Text
              style={[
                styles.fileItemText,
                { color: isSelected ? '#FFFFFF' : colors.text },
              ]}
              numberOfLines={1}
            >
              {getFileName(item.uri)}
            </Text>
            <Text
              style={[
                styles.fileSizeText,
                { color: isSelected ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary },
              ]}
            >
              {formatFileSize(item.size)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.removeButton, { borderColor: colors.textSecondary }]}
            onPress={() => onRemoveFile(item.uri)}
          >
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.secondary }]}
        onPress={onAddFile}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      
      <FlatList
        data={files}
        renderItem={renderItem}
        keyExtractor={(item) => item.uri}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderTopWidth: 1,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 26,
    alignSelf:'center'
  },
  list: {
    flex: 1,
  },
  listContent: {
    alignItems: 'center',
    paddingRight: 10,
  },
  fileItem: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    minWidth: 120,
    maxWidth: 220,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileItemText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  fileSizeText: {
    fontSize: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    position: 'relative',
  },
  fileInfo: {
    flexDirection: 'column',
    marginEnd: 12
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    // zIndex: 1,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.2,
    // shadowRadius: 1,
    // elevation: 2,
    borderWidth: 1,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});

export default FilePanel;
