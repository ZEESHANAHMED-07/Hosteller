import { Stack } from 'expo-router';
import "../styles/global.css"
import {Slot} from "expo-router"
import { AuthProvider } from './providers/AuthProvider'
import { ThemeProvider } from '../contexts/ThemeContext'

export default function RootLayout() {
  return(
    <ThemeProvider>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </ThemeProvider>
    );
}
