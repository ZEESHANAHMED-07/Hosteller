import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      // Add a minimum loading time for smooth UX
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    });
    return unsub;
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  // Show app-level loader during initialization
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.loaderContent}>
          <View style={styles.loaderIcon}>
            <Ionicons name="airplane" size={wp('12%')} color="#3B82F6" />
          </View>
          <ActivityIndicator size="large" color="#3B82F6" style={styles.spinner} />
          <Text style={styles.loaderTitle}>TravelConnect</Text>
          <Text style={styles.loaderSubtitle}>Connecting travelers worldwide...</Text>
        </View>
      </View>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderIcon: {
    width: wp('20%'),
    height: wp('20%'),
    backgroundColor: '#DBEAFE',
    borderRadius: wp('10%'),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp('3%'),
  },
  spinner: {
    marginBottom: hp('2%'),
  },
  loaderTitle: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: hp('1%'),
  },
  loaderSubtitle: {
    fontSize: wp('4%'),
    color: '#6B7280',
    textAlign: 'center',
  },
});
