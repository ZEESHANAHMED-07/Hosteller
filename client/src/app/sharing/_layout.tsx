import { Stack } from 'expo-router'
import { SignedIn, SignedOut } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'

export default function SharingLayout() {
  return (
    <>
      <SignedIn>
        <Stack />
      </SignedIn>

      <SignedOut>
        <Redirect href="/(auth)/sign-up" />
      </SignedOut>
    </>
  )
}
