import { View, Text,StyleSheet, TouchableOpacity, ActivityIndicator,Alert, ScrollView} from 'react-native'
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
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';

interface Contact {
  timeRecorded: string;
  timestamp: string;
  name: string;
}

const trips = ({ initialTime = "00:00:00" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [data, setData] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIntervalId, setCurrentIntervalId] = useState<null | number>(null);

  const [sliderValue, setSliderValue] = useState(0);
  const [playButtonText, setPlayButtonText] = useState('Play');
  const [playButtonIcon, setPlayButtonIcon] = useState('play');

  const [recordings, setRecordings] = useState<any[]>([]);
  const [sound, setSound] = useState<any>(null);

  const timeStringToSeconds = (timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };
  
  const [currentTimes, setCurrentTimes] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    return () => {
      currentTimes.forEach((_, timestamp) => {
        clearInterval(currentTimes.get(timestamp));
      });
    };
  }, []);

  const fetchContacts = async () => {
    try {
      const contactsString = await AsyncStorage.getItem('recordings2');
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


  const deleteContact = async (timestamp: string) => {
    try {
      // Fetch existing contacts
      const contactsString = await AsyncStorage.getItem('recordings2');
      if (contactsString !== null) {
        let contacts = JSON.parse(contactsString);

        // Filter out the contact to delete
        contacts = contacts.filter((contact: Contact) => contact.timestamp !== timestamp);

        // Save updated contacts back to AsyncStorage
        await AsyncStorage.setItem('recordings2', JSON.stringify(contacts));

        // Update state
        setContacts(contacts);
      }
    } catch (error) {
      console.error('Failed to delete contact', error);
    }
  };

  
  const milli = async (timestamp: string) => {
    try {
      currentTimes.forEach((_, timestamp) => {
        clearInterval(currentTimes.get(timestamp));
      });
      const contactsString = await AsyncStorage.getItem('recordings2');
      if (contactsString !== null) {
        let contacts = JSON.parse(contactsString);
        let contact = contacts.find((contact: Contact) => contact.timestamp === timestamp);
        if (!contact) return; // Exit if contact not found

        // Clear any existing interval for this contact
        clearInterval(currentTimes.get(timestamp));

        const intervalId = window.setInterval(() => {
          setCurrentTimes((prevTimes) => {
            const newTimes = new Map(prevTimes);
            const currentTime = newTimes.get(timestamp) || 0;
            const newValue = currentTime + 1; // Increment by 1, adjust as needed for your simulation speed
            if (newValue >= timeStringToSeconds(contact.timeRecorded)) {
              clearInterval(intervalId);
              newTimes.set(timestamp, timeStringToSeconds(contact.timeRecorded)); // Update currentTime to the final value
            } else {
              newTimes.set(timestamp, newValue); // Update currentTime with the new value
            }
            return newTimes;
          });
        }, 1000);

        // No need to store intervalId as we're not clearing intervals based on IDs anymore
      }
    } catch (error) {
      console.error('Failed to fetch contacts', error);
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
        <ScrollView style={{marginTop: 90}}>
      {contacts.length === 0 ? (
          <Text style={styles.text}>  No records available</Text>
        ) : (
          contacts.map((contact) => (
            <View style={styles.card} key={`${contact.timestamp}`}>
                <Text style={styles.text}>{contact.name}</Text>  
                <Text style={styles.text2}>Длительность: {contact.timeRecorded}</Text>
                <Text style={styles.text2}>Дата: {new Date(contact.timestamp).toLocaleString()}</Text>
                <View style={{marginLeft: 5, marginRight: 5,}}>
                  
                  <View style={{flexDirection: 'row',  justifyContent: 'space-between', paddingHorizontal: 10}}>
                    <Text>00:00:00</Text>
                    <Text>{contact.timeRecorded}</Text>
                  </View>
                  <Slider
                    style={{width: '100%', height: 40}}
                    minimumValue={0}
                    maximumValue={timeStringToSeconds(contact.timeRecorded)}
                    value={currentTimes.get(contact.timestamp) || 0}
                    // onValueChange={onSliderValueChange}
                    minimumTrackTintColor="#000"
                    thumbTintColor="#000"
                    maximumTrackTintColor="#000"
                  />
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 20}}>
                    <TouchableOpacity onPress={() => milli(contact.timestamp)} style={{ flexDirection: 'row',flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: 'black', justifyContent: 'center', alignItems: 'center', marginRight: 5, borderRadius: 5}}>
                      <Ionicons name="play" size={24} color="black" />
                      <Text style={{fontSize: 13,  fontFamily:`mon-b`,}}> Воспроизвести</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteContact(contact.timestamp)} style={{flexDirection: 'row', height: 40, flex: 1, backgroundColor: '#FF385C', justifyContent: 'center', alignItems: 'center', marginLeft: 5, borderRadius: 5}}>
                      <Ionicons name="trash" size={24} color="white" />
                      <Text style={{fontSize: 13,  fontFamily:`mon-b`, color: "white"}}> Удалить</Text>
                    </TouchableOpacity>
                  </View>
                </View> 
            </View>
          ))
        )}
        </ScrollView>
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
    gap: 5,
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
  
  text2: {
    fontSize: 20,
    fontFamily:`mon-b`,
    marginLeft: 15,
    color: '#FF385C',
  },
  text:{
    fontSize: 30,
    fontFamily:`mon-b`,
    marginLeft: 15,
    color: '#FF385C',
    marginTop: 20,
  }
});

export default trips