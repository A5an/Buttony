import { View, Text,StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useMemo, useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import ExploreHeader from '@/components/ExploreHeader';
import { defaultStyles } from '@/constants/Styles';
import { Marker } from 'react-native-maps';
import MapView from 'react-native-map-clustering';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import * as Location from 'expo-location';
import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

interface Contact {
  code: string;
  name: string;
}

const trips = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [data, setData] = useState(null);
  const fetchContacts = async () => {
    try {
      const contactsString = await AsyncStorage.getItem('userItems3');
      if (contactsString !== null) {
        // Data found in storage
        const contacts = JSON.parse(contactsString);
        console.log(contacts); // Do something with the contacts array
        return contacts;
      } else {
        console.log('No contacts found in storage.');
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch contacts', error);
      return [];
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadContacts = async () => {
        setIsLoading(true);
        const contacts = await fetchContacts();
        setContacts(contacts);
        setIsLoading(false);
      };

      loadContacts();
    }, [])
  );

  if (isLoading) {
    return <ActivityIndicator />;
  }


  return (
    <View style={{ flex: 1 }}>
       <Stack.Screen
        options={{
          header: () => <ExploreHeader/>,
        }}
      />
      <View style={defaultStyles.container}>
        <View style={{marginTop: 90}}>
      {contacts.length === 0 ? (
          <Text style={styles.text}>  No contacts available</Text>
        ) : (
          contacts.map((contact) => (
            <View style={styles.card} key={`${contact.code}-${contact.name}`}>
                <Text style={styles.text}>Имя - {contact.name}</Text>  
            </View>
          ))
        )}
        </View>
      <View style={styles.absoluteView}>
        <Link href="/(modals)/conta" asChild>
          <TouchableOpacity style={styles.btn}>
            <Text style={{ fontFamily: 'mon-sb', color: '#fff', fontSize: 55, marginTop: -6 }}>+</Text>
            {/* <Ionicons name="map" size={20} style={{ marginLeft: 10 }} color={'#fff'} /> */}
          </TouchableOpacity>
        </Link>
      </View>
    </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 80
  },
  searchSection: {
    height: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    marginTop: 20,
    borderColor: "#ABABAB",
    borderRadius: 8,
    marginBottom: 16,
  },
  searchIcon: {
    padding: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    margin: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    gap: 20,
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
    height: 70,
    width: 70,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  text:{
    fontSize: 30,
    fontFamily:`mon-b`,
    marginLeft: 15,
    color: '#FF385C',
    marginTop: 20,
    marginBottom: 20,
  }
});

export default trips