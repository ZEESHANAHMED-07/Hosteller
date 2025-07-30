import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-black px-6">
      <View className="w-full max-w-md">
        <Text className="text-3xl font-bold text-center mb-6 text-black dark:text-white">
          Welcome back
        </Text>
        <TextInput
          className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-4 py-3 mb-4 text-base text-black dark:text-white"
          autoCapitalize="none"
          keyboardType="email-address"
          value={emailAddress}
          placeholder="Email address"
          placeholderTextColor="#9CA3AF"
          onChangeText={(val) => setEmailAddress(val)}
        />
        <View className="relative mb-6">
          <TextInput
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-4 py-3 text-base text-black dark:text-white pr-12"
            value={password}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            onChangeText={(val) => setPassword(val)}
          />
          <TouchableOpacity 
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          className="w-full bg-blue-600 rounded-md py-3 mb-4"
          onPress={onSignInPress}>
          <Text className="text-white text-center font-semibold">Sign In</Text>
        </TouchableOpacity>
        <View className="flex-row justify-center space-x-1">
          <Text className="text-black dark:text-white">Don't have an account?</Text>
          <Link href="/(auth)/sign-up">
            <Text className="text-blue-600 font-semibold">Sign up</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  )
}