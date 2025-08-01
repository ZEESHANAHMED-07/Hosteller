import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link, router } from 'expo-router'
import { Text, View, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SignOutButton } from '@/components/SignOutButton'

export default function Page() {
  const { user } = useUser()

  const navigateToSettings = () => {
    router.push('/settings')
  }

  return (
    <View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-4 border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">TravelConnect</Text>
            <Text className="text-gray-600 text-sm mt-1">Share contacts, connect globally</Text>
          </View>
          <TouchableOpacity
            onPress={navigateToSettings}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View className="px-4 py-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                <Ionicons name="person" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  Welcome back!
                </Text>
                <Text className="text-gray-600 text-sm">
                  {user?.emailAddresses[0].emailAddress}
                </Text>
              </View>
            </View>
            
            <View className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4">
              <Text className="text-white font-medium mb-1">Ready to explore?</Text>
              <Text className="text-blue-100 text-sm">
                Connect with fellow travelers and share your journey
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mb-6">
          <Text className="text-gray-700 font-semibold text-lg mb-4">Quick Actions</Text>
          
          <View className="flex-row flex-wrap gap-3">
            <TouchableOpacity 
              className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-[45%]"
              onPress={() => router.push('/cards')}>
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="card-outline" size={24} color="#3B82F6" />
              </View>
              <Text className="font-medium text-gray-900 mb-1">Create Card</Text>
              <Text className="text-gray-600 text-xs">Create your travel card</Text>
            </TouchableOpacity>

            <TouchableOpacity 
            className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-[45%]"
            onPress={() => router.push('/sharing')}>
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="add-circle-outline" size={24} color="#059669" />
              </View>
              <Text className="font-medium text-gray-900 mb-1">Share Contact</Text>
              <Text className="text-gray-600 text-xs">Share your details with travelers</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-[45%]">
              <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="people-outline" size={24} color="#7C3AED" />
              </View>
              <Text className="font-medium text-gray-900 mb-1">Find Travelers</Text>
              <Text className="text-gray-600 text-xs">Discover nearby travelers</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-[45%]">
              <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="location-outline" size={24} color="#EA580C" />
              </View>
              <Text className="font-medium text-gray-900 mb-1">My Location</Text>
              <Text className="text-gray-600 text-xs">Update your current location</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100 min-w-[45%]">
              <View className="w-10 h-10 bg-pink-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="chatbubbles-outline" size={24} color="#DB2777" />
              </View>
              <Text className="font-medium text-gray-900 mb-1">Messages</Text>
              <Text className="text-gray-600 text-xs">Chat with connections</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="px-4 mb-6">
          <Text className="text-gray-700 font-semibold text-lg mb-4">Recent Activity</Text>
          
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <View className="p-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="person-add" size={16} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">New connection</Text>
                  <Text className="text-gray-500 text-sm">Someone saved your contact</Text>
                </View>
                <Text className="text-gray-400 text-xs">2h ago</Text>
              </View>
            </View>
            
            <View className="p-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="location" size={16} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">Location updated</Text>
                  <Text className="text-gray-500 text-sm">Now visible to nearby travelers</Text>
                </View>
                <Text className="text-gray-400 text-xs">1d ago</Text>
              </View>
            </View>
            
            <TouchableOpacity className="p-4">
              <Text className="text-blue-600 font-medium text-center">View all activity</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Card */}
        <View className="px-4 mb-8">
          <View className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 shadow-lg">
            <Text className="text-white font-semibold text-lg mb-4">Your Travel Network</Text>
            
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">12</Text>
                <Text className="text-indigo-200 text-sm">Connections</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">5</Text>
                <Text className="text-indigo-200 text-sm">Countries</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">28</Text>
                <Text className="text-indigo-200 text-sm">Interactions</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  )
}