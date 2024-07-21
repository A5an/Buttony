import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import React, { memo, useEffect, useRef, useState } from 'react';
import { defaultStyles } from '@/constants/Styles';
import { Marker } from 'react-native-maps';
import MapView from 'react-native-map-clustering';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  listings: any;
}

const INITIAL_REGION = {
  latitude: 37.33,
  longitude: -122,
  latitudeDelta: 9,
  longitudeDelta: 9,
};

const ListingsMap = memo(({ listings }: Props) => {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // When the component mounts, locate the user
  useEffect(() => {
    onLocateMe();
  }, []);

  const sendPostRequest = async () => {
    const sendPostRequest2 = async (item: any) => {
      try {
        console.log(item);
        const response = await fetch('https://chatter.salebot.pro/api/c9ab86995305ad85730979741ec97132/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: item.code,
            message: "taskunigga"
            // Add other item-specific data here
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data); // Handle the response data
      } catch (error) {
        console.error('Error:', error); // Handle the error
      }
    };
  
    const itemsString = await AsyncStorage.getItem('userItems3');
    if (itemsString) {
      try {
        const items = JSON.parse(itemsString);
        console.log('Items:', items);
        // Iterate over the items and make an API call for each
        for (const item of items) {
          await sendPostRequest2(item);
        }
      } catch (error) {
        console.error('Error parsing items from localStorage:', error);
      }
    }
  };

  const handlePress = () => {
     // Toggle animation state
    setTimeout(() => {
      sendPostRequest(); // Send the POST request after 10 seconds
    }, 1000); // 10000 milliseconds = 10 seconds
  };

  // When a marker is selected, navigate to the listing page
  const onMarkerSelected = (event: any) => {
    router.push(`/listing/${event.properties.id}`);
  };

  // Focus the map on the user's location and set the marker
  const onLocateMe = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    let location = await Location.getCurrentPositionAsync({});

    const region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 7,
      longitudeDelta: 7,
    };

    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    mapRef.current?.animateToRegion(region);
  };

  // Overwrite the renderCluster function to customize the cluster markers
  const renderCluster = (cluster: any) => {
    const { id, geometry, onPress, properties } = cluster;

    const points = properties.point_count;
    return (
      <Marker
        key={`cluster-${id}`}
        coordinate={{
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1],
        }}
        onPress={onPress}>
        <View style={styles.marker}>
          <Text
            style={{
              color: '#000',
              textAlign: 'center',
              fontFamily: 'mon-sb',
            }}>
            {points}
          </Text>
        </View>
      </Marker>
    );
  };

  return (
    <View style={defaultStyles.container}>
      <MapView
        ref={mapRef}
        animationEnabled={false}
        style={StyleSheet.absoluteFillObject}
        initialRegion={INITIAL_REGION}
        clusterColor="#fff"
        clusterTextColor="#000"
        clusterFontFamily="mon-sb"
        renderCluster={renderCluster}>
        {/* Render all our marker as usual */}
        {listings.features.map((item: any) => (
          <Marker
            coordinate={{
              latitude: item.properties.latitude,
              longitude: item.properties.longitude,
            }}
            key={item.properties.id}
            onPress={() => onMarkerSelected(item)}>
            <View style={styles.marker}>
              <Text style={styles.markerText}>€ {item.properties.price}</Text>
            </View>
          </Marker>
        ))}

        {/* Render user's current location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="You are here"
            pinColor="blue"
          />
        )}
      </MapView>
      <View style={styles.absoluteView}>
        <TouchableOpacity style={styles.btn} onPress={handlePress}>
          <Text style={{ fontFamily: 'mon-sb', color: '#fff', fontSize: 25 }}>SOS</Text>
          {/* <Ionicons name="map" size={20} style={{ marginLeft: 10 }} color={'#fff'} /> */}
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.locateBtn} onPress={onLocateMe}>
        <Ionicons name="navigate" size={24} color={Colors.dark} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 80
  },
  marker: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    elevation: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {
      width: 1,
      height: 10,
    },
  },
  absoluteView: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  btn: {
    backgroundColor: Colors.primary,
    padding: 14,
    height: 70,
    borderRadius: 30,
    flexDirection: 'row',
    marginHorizontal: 'auto',
    alignItems: 'center',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: {
      width: 1,
      height: 1,
    },
  },
  markerText: {
    fontSize: 14,
    fontFamily: 'mon-sb',
  },
  locateBtn: {
    position: 'absolute',
    top: 90,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {
      width: 1,
      height: 10,
    },
  },
});

export default ListingsMap;
