import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const SkeletonItem: React.FC<{ style: any; children?: React.ReactNode }> = ({ style, children }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, [opacity]);

  return (
    <Animated.View style={[style, { opacity, backgroundColor: '#f0f0f0' }]}>
      {children}
    </Animated.View>
  );
};

export const StatCardsSkeleton: React.FC = () => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: hp('1%') }}>
    {[1, 2, 3].map((index) => (
      <View key={index} style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: wp('4%'),
        padding: wp('4%'),
        alignItems: 'center',
        marginHorizontal: wp('1%'),
        height: hp('12%'),
      }}>
        <SkeletonItem style={{
          width: wp('10%'),
          height: wp('10%'),
          borderRadius: wp('5%'),
          marginBottom: hp('1%'),
        }} />
        <SkeletonItem style={{
          width: wp('8%'),
          height: hp('2.5%'),
          marginBottom: hp('0.5%'),
          borderRadius: 4,
        }} />
        <SkeletonItem style={{
          width: wp('12%'),
          height: hp('1.5%'),
          borderRadius: 4,
        }} />
      </View>
    ))}
  </View>
);

export const CardTypesSkeleton: React.FC = () => (
  <View>
    {[1, 2, 3].map((index) => (
      <View key={index} style={{
        backgroundColor: '#FFFFFF',
        borderRadius: wp('4%'),
        padding: wp('4%'),
        marginBottom: hp('2%'),
        flexDirection: 'row',
        alignItems: 'center',
        height: hp('12%'),
      }}>
        <SkeletonItem style={{
          width: wp('12%'),
          height: wp('12%'),
          borderRadius: wp('6%'),
          marginRight: wp('4%'),
          backgroundColor: '#f0f0f0',
        }} />
        <View style={{ flex: 1 }}>
          <SkeletonItem style={{
            width: '70%',
            height: hp('2.5%'),
            marginBottom: hp('0.5%'),
            backgroundColor: '#f0f0f0',
            borderRadius: 4,
          }} />
          <SkeletonItem style={{
            width: '90%',
            height: hp('1.8%'),
            marginBottom: hp('1%'),
            backgroundColor: '#f0f0f0',
            borderRadius: 4,
          }} />
          <View style={{ flexDirection: 'row', gap: wp('2%') }}>
            <SkeletonItem style={{
              width: wp('20%'),
              height: hp('2%'),
              borderRadius: wp('2%'),
              backgroundColor: '#f0f0f0',
            }} />
            <SkeletonItem style={{
              width: wp('25%'),
              height: hp('2%'),
              borderRadius: wp('2%'),
              backgroundColor: '#f0f0f0',
            }} />
            <SkeletonItem style={{
              width: wp('22%'),
              height: hp('2%'),
              borderRadius: wp('2%'),
              backgroundColor: '#f0f0f0',
            }} />
          </View>
        </View>
        <SkeletonItem style={{
          width: wp('5%'),
          height: wp('5%'),
          borderRadius: wp('2.5%'),
          backgroundColor: '#f0f0f0',
        }} />
      </View>
    ))}
  </View>
);

export const MyCardsSkeleton: React.FC = () => (
  <View style={{
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
    height: hp('12%'),
  }}>
    <SkeletonItem style={{
      width: wp('12%'),
      height: wp('12%'),
      borderRadius: wp('6%'),
      marginRight: wp('4%'),
      backgroundColor: '#f0f0f0',
    }} />
    <View style={{ flex: 1 }}>
      <SkeletonItem style={{
        width: '60%',
        height: hp('2.5%'),
        marginBottom: hp('0.5%'),
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
      }} />
      <SkeletonItem style={{
        width: '85%',
        height: hp('1.8%'),
        marginBottom: hp('1%'),
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
      }} />
      <View style={{ flexDirection: 'row', gap: wp('6%') }}>
        <View style={{ alignItems: 'center' }}>
          <SkeletonItem style={{
            width: wp('6%'),
            height: hp('2%'),
            marginBottom: hp('0.3%'),
            backgroundColor: '#f0f0f0',
            borderRadius: 4,
          }} />
          <SkeletonItem style={{
            width: wp('8%'),
            height: hp('1.5%'),
            backgroundColor: '#f0f0f0',
            borderRadius: 4,
          }} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <SkeletonItem style={{
            width: wp('6%'),
            height: hp('2%'),
            marginBottom: hp('0.3%'),
            backgroundColor: '#f0f0f0',
            borderRadius: 4,
          }} />
          <SkeletonItem style={{
            width: wp('8%'),
            height: hp('1.5%'),
            backgroundColor: '#f0f0f0',
            borderRadius: 4,
          }} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <SkeletonItem style={{
            width: wp('6%'),
            height: hp('2%'),
            marginBottom: hp('0.3%'),
            backgroundColor: '#f0f0f0',
            borderRadius: 4,
          }} />
          <SkeletonItem style={{
            width: wp('8%'),
            height: hp('1.5%'),
            backgroundColor: '#f0f0f0',
            borderRadius: 4,
          }} />
        </View>
      </View>
    </View>
    <SkeletonItem style={{
      width: wp('5%'),
      height: wp('5%'),
      borderRadius: wp('2.5%'),
      backgroundColor: '#f0f0f0',
    }} />
  </View>
);

export const TipsSkeleton: React.FC = () => (
  <View style={{
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    height: hp('20%'),
  }}>
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp('2%'),
    }}>
      <SkeletonItem style={{
        width: wp('8%'),
        height: wp('8%'),
        borderRadius: wp('4%'),
        marginRight: wp('3%'),
        backgroundColor: '#f0f0f0',
      }} />
      <SkeletonItem style={{
        width: wp('20%'),
        height: hp('2.5%'),
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
      }} />
    </View>
    
    {[1, 2, 3].map((index) => (
      <View key={index} style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: hp('1.5%'),
      }}>
        <SkeletonItem style={{
          width: wp('6%'),
          height: wp('6%'),
          borderRadius: wp('3%'),
          marginRight: wp('3%'),
          marginTop: hp('0.2%'),
          backgroundColor: '#f0f0f0',
        }} />
        <SkeletonItem style={{
          flex: 1,
          height: hp('4%'),
          backgroundColor: '#f0f0f0',
          borderRadius: 4,
        }} />
      </View>
    ))}
  </View>
);
