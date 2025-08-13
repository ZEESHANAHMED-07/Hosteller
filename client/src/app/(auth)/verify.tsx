import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { auth } from '../config/firebaseConfig';
import { db } from '../config/firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { router } from 'expo-router';

export default function VerifyEmailScreen() {
  const user = auth.currentUser;
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [status, setStatus] = useState<string>('');

  const email = useMemo(() => user?.email ?? 'Unknown', [user?.email]);
  const verified = user?.emailVerified ?? false;

  const ensureProfile = useCallback(async () => {
    try {
      const u = auth.currentUser;
      if (!u) return;
      const userRef = doc(db, 'users', u.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          email: u.email ?? email,
          username: u.displayName || (u.email ? u.email.split('@')[0] : 'user'),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else {
        await setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });
      }
    } catch (e) {
      console.warn('[VERIFY] ensureProfile failed', e);
    }
  }, [email]);

  useEffect(() => {
    if (!user) return;
    if (verified) {
      // Already verified, ensure profile then go to app
      ensureProfile().finally(() => router.replace('/'));
      return;
    }
    // Auto-poll every 10s for verification
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        await auth.currentUser?.reload();
        if (auth.currentUser?.emailVerified) {
          await ensureProfile();
          router.replace('/');
        }
      } catch (e) {
        // ignore transient errors
      }
    }, 10000);
  }, [user, verified]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startCooldown = (secs = 30) => {
    setCooldown(secs);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const onResend = useCallback(async () => {
    if (!user) {
      setStatus('Please sign in first.');
      return;
    }
    try {
      setSending(true);
      const authDomain = (auth.app.options as any)?.authDomain as string | undefined;
      const url = authDomain ? `https://${authDomain}/__/auth/action` : undefined;
      await sendEmailVerification(user, url ? { url, handleCodeInApp: false } : undefined as any);
      setStatus(`Verification email sent to ${email}.`);
      startCooldown(30);
    } catch (e: any) {
      console.warn('sendEmailVerification error', e);
      setStatus(e?.message ?? 'Failed to send verification email');
    } finally {
      setSending(false);
    }
  }, [user, email]);

  const onCheck = useCallback(async () => {
    if (!user) {
      setStatus('Please sign in first.');
      return;
    }
    try {
      setChecking(true);
      await user.reload();
      if (auth.currentUser?.emailVerified) {
        await ensureProfile();
        router.replace('/');
      } else {
        setStatus('Not verified yet. Please verify via the email link, then tap "I\'ve verified".');
      }
    } catch (e: any) {
      console.warn('reload check error', e);
      setStatus(e?.message ?? 'Failed to check verification status');
    } finally {
      setChecking(false);
    }
  }, [user]);

  const onSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      router.replace('/(auth)/sign-in');
    } catch (e: any) {
      setStatus(e?.message ?? 'Sign out failed. Please try again');
    }
  }, []);

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 8 }}>Sign in required</Text>
        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 16 }}>
          Please sign in to proceed with email verification.
        </Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')} style={{ backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 24, gap: 16, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>Verify your email</Text>
      <Text style={{ color: '#444' }}>We sent a verification link to:</Text>
      <Text style={{ fontWeight: '600' }}>{email}</Text>
      <Text style={{ color: '#666', textAlign: 'center', marginTop: 8 }}>
        Please check your inbox (and spam) for the verification email. After verifying, tap the button below.
      </Text>
      {!!status && (
        <Text style={{ color: '#2563eb', textAlign: 'center' }}>{status}</Text>
      )}

      <TouchableOpacity
        onPress={onResend}
        disabled={sending || cooldown > 0}
        style={{ opacity: sending || cooldown > 0 ? 0.6 : 1, backgroundColor: '#111827', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 }}>
        {sending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: '600' }}>
            {cooldown > 0 ? `Resend (${cooldown})` : 'Resend verification email'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCheck}
        disabled={checking}
        style={{ opacity: checking ? 0.6 : 1, backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 }}>
        {checking ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>I've verified</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSignOut} style={{ marginTop: 12 }}>
        <Text style={{ color: '#ef4444', fontWeight: '600' }}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}
