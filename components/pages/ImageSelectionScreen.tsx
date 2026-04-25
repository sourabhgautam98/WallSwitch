import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 60) / 3;

interface ImageSelectionScreenProps {
  onNext: (images: string[]) => void;
}

export default function ImageSelectionScreen({ onNext }: ImageSelectionScreenProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const pickImages = async () => {
    if (selectedImages.length >= 10) {
      Alert.alert('Limit Reached', 'You can only select up to 10 images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 10 - selectedImages.length,
      quality: 1,
    });

    if (!result.canceled) {
      const newUris = result.assets.map(asset => asset.uri);
      setSelectedImages(prev => {
        const combined = [...prev, ...newUris];
        return combined.slice(0, 10);
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleNext = () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Images Selected', 'Please select at least one image to continue.');
      return;
    }
    onNext(selectedImages);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Gallery Selection</ThemedText>
        <ThemedText style={styles.subtitle}>
          Select up to 10 images from your gallery to create your wallpaper rotation.
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {selectedImages.map((uri, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
          {selectedImages.length < 10 && (
            <TouchableOpacity style={styles.addButton} onPress={pickImages}>
              <Ionicons name="add" size={40} color="#888" />
              <ThemedText style={styles.addText}>{selectedImages.length}/10</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <ThemedText style={styles.nextButtonText}>Next</ThemedText>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addButton: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 200, 200, 0.1)',
  },
  addText: {
    marginTop: 8,
    fontSize: 12,
    color: '#888',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.2)',
  },
  nextButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 25,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
