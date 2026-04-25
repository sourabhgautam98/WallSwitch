import React from 'react';
import { router } from 'expo-router';
import ImageSelectionScreen from '@/components/pages/ImageSelectionScreen';

export default function HomeScreen() {
  const handleNext = (images: string[]) => {
    router.push({
      pathname: '/config',
      params: { images: JSON.stringify(images) }
    });
  };

  return <ImageSelectionScreen onNext={handleNext} />;
}
