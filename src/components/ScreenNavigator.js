import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import {createBottomTabNavigator} from 'react-navigation';
import Order from './Order';
import MainScreen from './mainScreen';
import Icon from 'react-native-vector-icons/Ionicons'; 


export default createBottomTabNavigator({
    MainScreen:{
        screen: MainScreen,
        navigationOptions:{
            tabBarLabel: 'Procure',
            tabBarIcon:({tintColor})=>(<Icon name='ios-compass' 
            color={tintColor} size={24}/>)}},
    Order:{
        screen: Order,
        navigationOptions:{
            tabBarLabel: 'Cash Flow',
            tabBarIcon:({tintColor})=>(<Icon name='md-cash' 
            color={tintColor} size={24}/>)}},
    
   
   
},{
  tabBarOptions:{
    activeTintColor:'white',
    inactiveTintColor:'rgba(107, 185, 240, 1)',
    style:{
      backgroundColor:'rgba(1, 50, 67, 1)',
      borderTopWidth:0,
      elevation:5
    }
  }
});

