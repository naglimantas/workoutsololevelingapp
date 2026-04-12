import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../theme/colors';

import HunterCreationScreen from '../screens/HunterCreationScreen';
import HomeDashboardScreen from '../screens/HomeDashboardScreen';
import HunterProfileScreen from '../screens/HunterProfileScreen';
import DailyQuestsScreen from '../screens/DailyQuestsScreen';
import WorkoutLibraryScreen from '../screens/WorkoutLibraryScreen';
import CustomWorkoutBuilderScreen from '../screens/CustomWorkoutBuilderScreen';
import ActiveWorkoutScreen from '../screens/ActiveWorkoutScreen';
import BossBattleScreen from '../screens/BossBattleScreen';
import ProgressScreen from '../screens/ProgressScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import RankUpScreen from '../screens/RankUpScreen';

const Stack = createStackNavigator();

const screenOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: colors.background },
  cardStyleInterpolator: ({ current, layouts }) => ({
    cardStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
      transform: [
        {
          translateY: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          }),
        },
      ],
    },
  }),
  transitionSpec: {
    open: { animation: 'timing', config: { duration: 350 } },
    close: { animation: 'timing', config: { duration: 280 } },
  },
};

const modalOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: 'transparent' },
  presentation: 'transparentModal',
  cardStyleInterpolator: ({ current }) => ({
    cardStyle: {
      opacity: current.progress,
    },
  }),
};

export default function AppNavigator({ isNewUser }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isNewUser ? 'HunterCreation' : 'HomeDashboard'}
        screenOptions={screenOptions}
      >
        <Stack.Screen name="HunterCreation" component={HunterCreationScreen} />
        <Stack.Screen name="HomeDashboard" component={HomeDashboardScreen} />
        <Stack.Screen name="HunterProfile" component={HunterProfileScreen} />
        <Stack.Screen name="DailyQuests" component={DailyQuestsScreen} />
        <Stack.Screen name="WorkoutLibrary" component={WorkoutLibraryScreen} />
        <Stack.Screen name="CustomWorkoutBuilder" component={CustomWorkoutBuilderScreen} />
        <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
        <Stack.Screen name="BossBattle" component={BossBattleScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen
          name="RankUp"
          component={RankUpScreen}
          options={modalOptions}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
