# Migrating to React Native (Expo)

To turn this project into a mobile app that works with **Expo Go**, follow these steps:

## 1. Setup Local Environment
You cannot run Expo Go directly inside the browser IDE. You must download the code and run it on your computer.

1. Click **Settings > Download Project** (or similar) in AI Studio.
2. Open your terminal on your computer.
3. Install Expo CLI:
   ```bash
   npm install --global expo-cli
   ```

## 2. Initialize Expo Project
Create a new expo project:
```bash
npx create-expo-app MyAttendanceApp
cd MyAttendanceApp
```

## 3. Install Dependencies
```bash
npx expo install firebase lucide-react-native react-native-reanimated react-native-gesture-handler @react-native-async-storage/async-storage
```

## 4. Code is Already React Native
Great news! I have already refactored the entire project to use **React Native** components (`View`, `Text`, `TouchableOpacity`, `StyleSheet`).

This means you can copy the contents of `src/App.tsx`, `src/components/*.tsx`, and `src/hooks/*.tsx` directly into your native project with minimal changes.

### Key Points for Native:
1. **Icons**: I am using `lucide-react` for the web preview. In a real mobile app, you should install `lucide-react-native`.
2. **Navigation**: For a full mobile app, you might want to add `@react-navigation/native`.
3. **Storage**: I used Firebase, which works natively on both.

## 5. Main App Example (App.tsx)
Copy the logic from your `App.tsx` into the new Expo project's `App.tsx`.

### Sample Snippet for React Native:
```tsx
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { GraduationCap } from 'lucide-react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <GraduationCap color="#002B5B" size={48} />
      <Text style={styles.title}>JKUAT Attendance</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#002B5B',
    padding: 15,
    borderRadius: 10,
    marginTop: 40,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
```

## 6. Testing
Run `npx expo start` and scan the QR code with your **Expo Go** app on your phone.
