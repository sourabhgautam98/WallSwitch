import React from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import ConfigurationScreen from '@/components/pages/ConfigurationScreen';
import ExpoWallpaper from '@/modules/expo-wallpaper';

const INTERVAL_MAP: Record<string, number> = {
  '30s': 30 * 1000,
  '1m': 60 * 1000,
  '3m': 3 * 60 * 1000,
  '5m': 5 * 60 * 1000,
  '10m': 10 * 60 * 1000,
  'daily': 24 * 60 * 60 * 1000,
};

export default function ConfigRoute() {
  const params = useLocalSearchParams();
  const images = params.images ? JSON.parse(params.images as string) : [];

  const handleApply = async (config: { interval: string; target: string[] }) => {
    if (images.length === 0) {
      Alert.alert('No Images', 'Please select at least one image.');
      return;
    }

    if (config.target.length === 0) {
      Alert.alert('No Target Selected', 'Please select at least one target (Home Screen or Lock Screen).');
      return;
    }

    try {
      const intervalMs = INTERVAL_MAP[config.interval] || 60000;
      await ExpoWallpaper.startRotation(images, intervalMs, config.target);
      
      Alert.alert(
        'Success', 
        'Wallpaper rotation started successfully!',
        [{ text: 'OK', onPress: () => router.navigate('/') }]
      );
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to apply wallpaper rotation');
    }
  };

  return <ConfigurationScreen images={images} onApply={handleApply} />;
}

