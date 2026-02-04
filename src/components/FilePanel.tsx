import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ListRenderItem,
  TextInput,
} from 'react-native';
import { ThemeContextType } from '../contexts/ThemeContext';

import { formatFileSize } from '../services/FileSizeService';
import type { FileInfo } from '../types';

interface FilePanelProps {
  files: FileInfo[];
  selectedFile: string | null;
  onFileSelect: (file: string) => void;
  onAddFile: () => void;
  onAddUrl: (url: string) => void;
  onRemoveFile: (file: string) => void;
  colors: ThemeContextType['colors'];
}

const FilePanel: React.FC<FilePanelProps> = ({
  files,
  selectedFile,
  onFileSelect,
  onAddFile,
  onAddUrl,
  onRemoveFile,
  colors,
}) => {
  const [isUrlPopupVisible, setIsUrlPopupVisible] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const getFileName = (uri: string) => {
    try {
      if (uri.startsWith('http://') || uri.startsWith('https://')) {
        const parts = uri.split('/');
        return parts.pop() || 'Remote File';
      }
      const parts = uri.split('/');
      return parts.pop() || 'Unknown File';
    } catch (e) {
      return 'Unknown File';
    }
  };

  const handleOpenUrl = () => {
    if (urlInput.trim()) {
      onAddUrl(urlInput.trim());
      setUrlInput('');
      setIsUrlPopupVisible(false);
    }
  };

  const renderItem: ListRenderItem<FileInfo> = ({ item }) => {
    const isSelected = item.uri === selectedFile;
    return (
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
              {item.size ? formatFileSize(item.size) : 'Remote'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.removeButton, { borderColor: colors.textSecondary, backgroundColor: colors.background }]}
            onPress={() => onRemoveFile(item.uri)}
          >
            <Text style={[styles.removeButtonText, { color: colors.textSecondary }]}>×</Text>
          </TouchableOpacity>
        </TouchableOpacity>
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
      
      <TouchableOpacity
        style={[styles.urlButton, { backgroundColor: colors.secondary }]}
        onPress={() => setIsUrlPopupVisible(true)}
      >
        <Text style={styles.urlButtonText}>URL</Text>
      </TouchableOpacity>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {isUrlPopupVisible && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalDismissArea} 
            activeOpacity={1} 
            onPress={() => setIsUrlPopupVisible(false)} 
          />
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Open from URL</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="https://example.com/animation.json"
              placeholderTextColor={colors.textSecondary}
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              autoFocus={true}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setIsUrlPopupVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleOpenUrl}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Open</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
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
    marginRight: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 26,
    alignSelf:'center'
  },
  urlButton: {
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  divider: {
    width: 1,
    height: 32,
    marginHorizontal: 12,
  },
  modalOverlay: {
    position: 'absolute',
    bottom: 0,
    left: -10, // Adjust for FilePanel padding
    right: -10,
    height: 1000, // Large enough to cover the screen
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalDismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    minHeight: 60,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    alignItems: 'center',
    paddingRight: 10,
  },
  fileItem: {
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 12,
    marginRight: 8, 
    borderWidth: 1,
    height: 48,
    width: 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:'space-between',
  },
  fileItemText: {
    fontSize: 13,
    marginBottom: 2,
  },
  fileSizeText: {
    fontSize: 10,
  },
  fileInfo: {
    flexDirection: 'column',
    flex:1,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    marginStart: 8,
    // zIndex: 1,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.2,
    // shadowRadius: 1,
    // elevation: 2,
    borderWidth: 1,
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});

export default FilePanel;
