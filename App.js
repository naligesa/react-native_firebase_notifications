import React, {Component} from 'react';
import {Platform, Text, View} from 'react-native';
import firebase from 'react-native-firebase';

export default class App extends Component {
  subscribeToNotificationListeners() {
    const channel = new firebase.notifications.Android.Channel(
      'Default', // To be Replaced as per use
      'Default', // To be Replaced as per use
      firebase.notifications.Android.Importance.Max,
    ).setDescription(
      'A Channel To manage the notifications related to Application',
    );
    firebase.notifications().android.createChannel(channel);

    //If your app is in the foreground, or background, you can listen for when a notification is clicked / tapped / opened as follows:
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened((notificationOpen) => {
        // Get the action triggered by the notification being opened
        const action = notificationOpen.action;
        // Get information about the notification that was opened
        const notification = notificationOpen.notification;
        console.log('Notification is opened', notification._data.Page);
      });

    this.notificationListener = firebase
      .notifications()
      .onNotification((notification) => {
        // console.log('onNotification notification-->', notification);
        // console.log('onNotification notification.data -->', notification.data);
        // console.log(
        //   'onNotification notification.notification -->',
        //   notification.notification,
        // );
        // Process your notification as required
        this.displayNotification(notification);
      });
  }

  displayNotification = (notification) => {
    if (Platform.OS === 'android') {
      const localNotification = new firebase.notifications.Notification({
        sound: 'default',
        show_in_foreground: true,
      })
        .setNotificationId(notification.notificationId)
        .setTitle(notification.title)
        .setSubtitle(notification.subtitle)
        .setBody(notification.body)
        .setData(notification.data)
        .android.setChannelId('Default') // e.g. the id you chose above
        .android.setSmallIcon('ic_notification') // create this icon in Android Studio
        .android.setColor('black') // you can set a color here
        .android.setPriority(firebase.notifications.Android.Priority.High);

      firebase
        .notifications()
        .displayNotification(localNotification)
        .catch((err) => console.error(err));
    }
  };

  async componentDidMount() {
    firebase
      .messaging()
      .hasPermission()
      .then((hasPermission) => {
        if (hasPermission) {
          this.subscribeToNotificationListeners();
        } else {
          firebase
            .messaging()
            .requestPermission()
            .then(() => {
              this.subscribeToNotificationListeners();
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });

    //If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      // App was opened by a notification
      // Get the action triggered by the notification being opened
      const action = notificationOpen.action;
      // Get information about the notification that was opened
      const notification = notificationOpen.notification;
      console.log('App opened from quit state', notification);
    }
  }

  componentWillUnmount() {
    this.notificationListener();
  }

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{fontSize: 18}}> Firebase Notifications Example </Text>
      </View>
    );
  }
}
