import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  ToastAndroid,
} from "react-native";
import { useState } from "react";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { TextInput } from "react-native-gesture-handler";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { defaultStyles } from "@/constants/Styles";
import ExploreHeader from "@/components/Settings";
import Colors from "@/constants/Colors";
import { places } from "@/assets/data/places";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { v4 as uuidv4 } from "uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore
import DatePicker from "react-native-modern-datepicker";

interface Item {
  // id: string;
  code: string;
  name: string;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const Page = () => {
  const [openCard, setOpenCard] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState(0);

  const router = useRouter();
  const today = new Date().toISOString().substring(0, 10);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [items, setItems] = useState<Item[]>([]);

  const saveData = async () => {
    // const id = uuidv4();
    const newItem = { code, name };
    const updatedItems = [...items, newItem];
    setItems(updatedItems);

    try {
      console.log("Retrieving existing items...");
      const itemsString = await AsyncStorage.getItem("userItems3");
      console.log("Current itemsString:", itemsString);
      let items = [];
      if (itemsString) {
        items = JSON.parse(itemsString);
      }
      console.log("Parsed items:", items);
      const updatedItems = [...items, newItem];
      console.log("Updated items:", updatedItems);
      await AsyncStorage.setItem("userItems3", JSON.stringify(updatedItems));
      console.log("Items saved successfully.");
    } catch (error) {
      console.error("Failed to save items", error);
    }
  };
  const clearAllData = async () => {
    try {
      await AsyncStorage.removeItem("userItems3");
      console.log("Item removed successfully");
    } catch (error) {
      console.error("Failed to remove the item", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          header: () => <ExploreHeader />,
        }}
      />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BlurView intensity={70} style={styles.container} tint="light">
          {/*  Where */}

          <View style={styles.card}>
            {
              <Animated.View
                entering={FadeIn}
                exiting={FadeOut}
                style={styles.cardBody}
              >
                <Text style={styles.text}>Введите данные контакта</Text>
                <View style={styles.searchSection}>
                  <Ionicons
                    style={styles.searchIcon}
                    name="person"
                    size={20}
                    color="#000"
                  />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Айсулу"
                    placeholderTextColor={Colors.grey}
                    onChangeText={setName}
                  />
                </View>
                <View
                  style={{
                    height: 50,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    marginTop: 5,
                    borderColor: "#ABABAB",
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                >
                  <Ionicons
                    style={styles.searchIcon}
                    name="lock-closed"
                    size={20}
                    color="#000"
                  />
                  <TextInput
                    style={styles.inputField}
                    placeholder="1234567"
                    placeholderTextColor={Colors.grey}
                    onChangeText={setCode}
                  />
                </View>
              </Animated.View>
            }
          </View>

          {/* Footer */}
          <Animated.View
            style={defaultStyles.footer}
            entering={SlideInDown.delay(200)}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "flex-end",
              }}
            >
              <TouchableOpacity
                style={[
                  defaultStyles.btn,
                  { paddingRight: 20, paddingLeft: 50 },
                ]}
                onPress={() => {
                  ToastAndroid.show(
                    "Контакт сохранен успешно!",
                    ToastAndroid.LONG
                  );
                  saveData();
                  router.back();
                }}
              >
                <Ionicons
                  name="save"
                  size={24}
                  style={defaultStyles.btnIcon}
                  color={"#fff"}
                />
                <Text style={defaultStyles.btnText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </BlurView>
      </GestureHandlerRootView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
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
  cardHeader: {
    fontFamily: "mon-b",
    fontSize: 24,
    padding: 20,
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
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
  inputField: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  placesContainer: {
    flexDirection: "row",
    gap: 25,
  },
  place: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  text: {
    fontSize: 20,
    fontFamily: `mon-b`,
    marginLeft: 35,
    color: "#000",
    marginTop: 20,
  },
  placeSelected: {
    borderColor: Colors.grey,
    borderWidth: 2,
    borderRadius: 10,
    width: 100,
    height: 100,
  },
  previewText: {
    fontFamily: "mon-sb",
    fontSize: 14,
    color: Colors.grey,
  },
  previewdData: {
    fontFamily: "mon-sb",
    fontSize: 14,
    color: Colors.dark,
  },

  guestItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.grey,
  },
});
export default Page;
