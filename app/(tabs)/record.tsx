import { View, StyleSheet, Text, TouchableOpacity, Animated, PermissionsAndroid, Platform} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Stack } from 'expo-router';
import ExploreHeader from '@/components/ExploreHeader';
import { defaultStyles } from '@/constants/Styles';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const rec = () => {
  const [scaleAnim] = useState(new Animated.Value(0)); 
  const [opacityAnim] = useState(new Animated.Value(1)); 
  const [isAnimating, setIsAnimating] = useState(false);
  const [text, setText] = useState('Запись')
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [running, setRunning] = useState(false);
  const [intervalId, setIntervalId] = useState<number | undefined>(undefined);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

  const startRecording = async () => {
    await requestPermissions();
    const path = Platform.select({
      ios: 'hello.m4a',
      android: `${Math.floor(Math.random() * 100000)}.mp4`,
    });
    await audioRecorderPlayer.startRecorder(path);
    audioRecorderPlayer.addRecordBackListener((e) => {
      setSeconds(Math.floor(e.currentPosition / 1000) % 60);
      setMinutes(Math.floor(e.currentPosition / 1000 / 60) % 60);
      setHours(Math.floor(e.currentPosition / 1000 / 3600));
    });
    setRunning(true);
    return path;
  };

  const stopRecording = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setRunning(false);
    return result;
  };

  const saveRecording = async (path: string) => {
    const randomNumber = Math.floor(Math.random() * 1000000); // Generate a random number
    const name = `Запись №${randomNumber}`
    const timeRecorded = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
    const recordings = JSON.parse(await AsyncStorage.getItem('recordings2') || '[]');
    recordings.push({ path, name, timeRecorded, timestamp: new Date().toISOString() });
    await AsyncStorage.setItem('recordings2', JSON.stringify(recordings));
    console.log('Recording saved:', { path, timeRecorded });
  };

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  const toggleTimer = () => {
    if (running) {
      clearInterval(intervalId);
      setIntervalId(undefined);
    } else {
      const id = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 59) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 59) {
                setHours((prevHours) => prevHours + 1);
                return 0;
              }
              return prevMinutes + 1;
            });
            return 0;
          }
          return prevSeconds + 1;
        });
      }, 1000) as unknown as number;
      setIntervalId(id);
    }
    setRunning(!running);
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
        
        if (
          granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
        } else {
          console.log('Permissions denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  

      const formatTime = (time: number) => {
        return time.toString().padStart(2, '0');
      };

      const resetTimer = () => {
        if (intervalId) clearInterval(intervalId);
        setSeconds(0);
        setMinutes(0);
        setHours(0);
        setRunning(false);
        setIntervalId(undefined);
      };
      

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

  const handlePress = async () => {
     // Toggle animation state
    setIsAnimating(!isAnimating);
    setTimeout( async () => {
      sendPostRequest(); // Send the POST request after 10 seconds
    }, 15000);
    if (running) {
      const result = await stopRecording();
      resetTimer();
      await saveRecording(result);
    } else {
      resetTimer();
      toggleTimer()
      const path = await startRecording();
      console.log('Recording started:', path);
    }
     // 10000 milliseconds = 10 seconds
  };

  useEffect(() => {
    let animation: any;
    if (isAnimating) {
      // Start the animation
      animation = Animated.loop(
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 2,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      );
      setText("Стоп")
      animation.start();
    } else {
      // Reset animation values and stop it
      scaleAnim.setValue(0);
      opacityAnim.setValue(1);
      if (animation) {
        animation.stop();
      }
      setText("Запись")
    }
    // Cleanup function to stop the animation when the component unmounts or animation toggles off
    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isAnimating, scaleAnim, opacityAnim]);


  return (
    <View style={{ flex: 1 }}>
       <Stack.Screen
        options={{
          header: () => <ExploreHeader/>,
        }}
      />
      
      <View style={styles.container}>
      <Text style={{ fontFamily: 'mon-b', color: '#fff', fontSize: 55, marginBottom: 120, marginTop: -50 }}>
        {`${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`}
      </Text>
      <TouchableOpacity style={styles.btn} onPress={() => {
        handlePress()
      }}>
        <Text style={{ fontFamily: 'mon-b', color: Colors.primary, fontSize: 25,  }}>{text}</Text>
      </TouchableOpacity>
      <Animated.View
          style={[
            styles.circle,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        />
    </View>
    </View>
  )}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 80,
        backgroundColor: Colors.primary,
        justifyContent: 'center', 
    alignItems: 'center',
    },

    btn: {
      backgroundColor: "#fff",
      marginBottom: 140,
      width: 160,
      height: 160,
      borderRadius: 1000,
      justifyContent: 'center', 
      alignItems: 'center',
      elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {
      width: 1,
      height: 10,
    },
    zIndex: 1
    },
    circle: {
      position: 'absolute',
      width: 160,
      height: 160,
      borderRadius: 1000,
      backgroundColor: 'rgba(255,255,255,0.5)',
      zIndex: -1
    },
});

export default rec