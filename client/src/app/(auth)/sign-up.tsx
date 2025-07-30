import * as React from 'react'
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-black px-6">
        <View className="w-full max-w-md">
          <Text className="text-2xl font-bold text-center mb-6 text-black dark:text-white">
            Verify your email
          </Text>
          <TextInput
            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-4 py-3 mb-4 text-base text-black dark:text-white"
            value={code}
            placeholder="Verification code"
            placeholderTextColor="#9CA3AF"
            onChangeText={(val) => setCode(val)}
            keyboardType="number-pad"
          />
          <TouchableOpacity
            className="w-full bg-blue-600 rounded-md py-3 mb-2"
            onPress={onVerifyPress}>
            <Text className="text-white text-center font-semibold">Verify</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-black px-6">
      <View className="w-full max-w-md">
        <Text className="text-3xl font-bold text-center mb-6 text-black dark:text-white">
          Create an account
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
          onPress={onSignUpPress}>
          <Text className="text-white text-center font-semibold">Continue</Text>
        </TouchableOpacity>
        <View className="flex-row justify-center space-x-1">
          <Text className="text-black dark:text-white">Already have an account?</Text>
          <Link href="/(auth)/sign-in">
            <Text className="text-blue-600 font-semibold">Sign in</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  )
}