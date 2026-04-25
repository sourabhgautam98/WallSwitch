import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ConfigurationScreenProps {
  images: string[];
  onApply: (config: { interval: string; target: string[] }) => void;
}

const INTERVALS = [
  { label: '30 Seconds', value: '30s' },
  { label: '1 Minute', value: '1m' },
  { label: '3 Minutes', value: '3m' },
  { label: '5 Minutes', value: '5m' },
  { label: '10 Minutes', value: '10m' },
  { label: 'Daily', value: 'daily' },
];

export default function ConfigurationScreen({ images, onApply }: ConfigurationScreenProps) {
  const [selectedInterval, setSelectedInterval] = useState('1m');
  const [selectedTargets, setSelectedTargets] = useState<string[]>(['home', 'lock']);

  const toggleTarget = (target: string) => {
    setSelectedTargets(prev => {
      if (prev.includes(target)) {
        // Prevent deselecting both
        if (prev.length === 1) return prev;
        return prev.filter(t => t !== target);
      }
      return [...prev, target];
    });
  };

  const handleApply = () => {
    onApply({
      interval: selectedInterval,
      target: selectedTargets,
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Section 1: Selected Images */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Selected Images ({images.length})</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScroll}>
            {images.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.thumbnail} />
            ))}
          </ScrollView>
        </View>

        {/* Section 2: Change Interval */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Change Interval</ThemedText>
          <View style={styles.intervalGrid}>
            {INTERVALS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.intervalOption,
                  selectedInterval === item.value && styles.intervalOptionSelected
                ]}
                onPress={() => setSelectedInterval(item.value)}
              >
                <ThemedText style={[
                  styles.intervalText,
                  selectedInterval === item.value && styles.intervalTextSelected
                ]}>
                  {item.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section 3: Apply Target */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Apply Target</ThemedText>
          <View style={styles.targetRow}>
            <TouchableOpacity
              style={[
                styles.targetOption,
                selectedTargets.includes('home') && styles.targetOptionSelected
              ]}
              onPress={() => toggleTarget('home')}
            >
              <Ionicons 
                name={selectedTargets.includes('home') ? "home" : "home-outline"} 
                size={24} 
                color={selectedTargets.includes('home') ? "white" : "#0a7ea4"} 
              />
              <ThemedText style={[
                styles.targetText,
                selectedTargets.includes('home') && styles.targetTextSelected
              ]}>Home Screen</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.targetOption,
                selectedTargets.includes('lock') && styles.targetOptionSelected
              ]}
              onPress={() => toggleTarget('lock')}
            >
              <Ionicons 
                name={selectedTargets.includes('lock') ? "lock-closed" : "lock-closed-outline"} 
                size={24} 
                color={selectedTargets.includes('lock') ? "white" : "#0a7ea4"} 
              />
              <ThemedText style={[
                styles.targetText,
                selectedTargets.includes('lock') && styles.targetTextSelected
              ]}>Lock Screen</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Section 4: Apply Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <ThemedText style={styles.applyButtonText}>Apply Wallpaper</ThemedText>
          <Ionicons name="checkmark-circle" size={24} color="white" />
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
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  imageScroll: {
    gap: 12,
  },
  thumbnail: {
    width: 100,
    height: 150,
    borderRadius: 12,
  },
  intervalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  intervalOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    backgroundColor: 'transparent',
  },
  intervalOptionSelected: {
    backgroundColor: '#0a7ea4',
  },
  intervalText: {
    color: '#0a7ea4',
  },
  intervalTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  targetRow: {
    flexDirection: 'row',
    gap: 12,
  },
  targetOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    backgroundColor: 'transparent',
  },
  targetOptionSelected: {
    backgroundColor: '#0a7ea4',
  },
  targetText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  targetTextSelected: {
    color: 'white',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.2)',
  },
  applyButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 25,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
