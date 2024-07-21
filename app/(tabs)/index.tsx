import { View, Text } from 'react-native';
import React, { useMemo, useState } from 'react';
import ListingsBottomSheet from '@/components/ListingsBottomSheet';
import listingsData from '@/assets/data/airbnb-listings.json';
import ListingsMap from '@/components/ListingsMap';
import listingsDataGeo from '@/assets/data/airbnb-listings.geo.json';
import { Stack } from 'expo-router';
import ExploreHeader from '@/components/ExploreHeader';
import { NavigationContainer } from '@react-navigation/native';

const Page = () => {
  const items = useMemo(() => listingsData as any, []);
  const getoItems = useMemo(() => listingsDataGeo, []);
  const [category, setCategory] = useState<string>('Tiny homes');

  const onDataChanged = (category: string) => {
    setCategory(category);
  };
  

  return (
    <View style={{ flex: 1 }}>
        <Stack.Screen
        options={{
          header: () => <ExploreHeader />,
        }}
      />
      <ListingsMap listings={getoItems} />
      {/* <ListingsBottomSheet listings={items} category={category} /> */}
    </View>
  );
};

export default Page;
