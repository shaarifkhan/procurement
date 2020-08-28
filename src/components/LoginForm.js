import React, { Component } from "react";
import MainScreen from "./mainScreen";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  AsyncStorage,
  ToastAndroid,
  StatusBar,
  Button,
} from "react-native";
import * as firebase from "firebase";
import ScreenNavigator from "./ScreenNavigator";

export default class LoginForm extends Component {
  state = {
    username: "",
    password: "",
    loading: false,
    error: "",
    authUser: null,
  };
  componentDidMount() {
    //Get saved user if already there
    AsyncStorage.getItem("authUser").then((v) =>
      v
        ? this.setState({
            authUser: JSON.parse(v),
          })
        : null
    );

    //Save user if auth successful
    firebase.auth().onAuthStateChanged((authUser) => {
      authUser
        ? this.setState({
            authUser,
          })
        : this.setState({
            authUser: null,
          });
      if (authUser) {
        AsyncStorage.setItem("authUser", JSON.stringify(authUser));
      }
    });
  }

  onPressSignIn() {
    // console.log("in press singin");
    const { username, password } = this.state;
    this.setState({
      loading: true,
    });
    firebase
      .auth()
      .signInWithEmailAndPassword(username, password)
      .then(() => {
        this.setState({
          loading: false,
        });
      })
      .catch((e) => {
        console.log(e);
        Alert.alert("Error", "Cant Login");
      });
  }
  onPressSignUp() {
    const { username, password } = this.state;
    this.setState({
      loading: true,
    });

    firebase
      .auth()
      .createUserWithEmailAndPassword(username, password)
      .then(() => {
        this.setState({
          loading: false,
        });
      })
      .catch((e) => {
        console.log(e);
        this.setState({
          error: "Authentication Failure",
          loading: false,
        });
        Alert.alert("Error", "Authentication Failure");
      });
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.logoContainer}>
          <ActivityIndicator style={styles.loading} size="large" />
        </View>
      );
    }
    if (this.state.authUser) {
      return <ScreenNavigator />;
    } else {
      return (
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.container}
          enabled
        >
          <View style={styles.logoContainer}>
            <StatusBar
              backgroundColor="rgba(30, 139, 195, 1)"
              barStyle="light-content"
            />
            <Image
              style={styles.logoStyle}
              source={require("../images/logo.png")}
            />
            <Text style={styles.TextStyle}>Internal Management</Text>
          </View>
          <View style={styles.loginContainer}>
            <TextInput
              placeholder="username"
              placeholderTextColor="#000"
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={() => this.passwordInput.focus()}
              style={styles.TextInputStyle}
              value={this.state.username}
              onChangeText={(username) => this.setState({ username })}
            />
            <TextInput
              placeholder="password"
              placeholderTextColor="#000"
              secureTextEntry
              ref={(input) => (this.passwordInput = input)}
              style={styles.TextInputStyle}
              value={this.state.password}
              onChangeText={(password) => this.setState({ password })}
            />
            <TouchableOpacity
              style={styles.ButtonStyle}
              onPress={() => this.onPressSignIn()}
            >
              <Text style={styles.ButtonTextStyle}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ButtonStyle}
              onPress={() => this.onPressSignUp()}
            >
              <Text style={styles.ButtonTextStyle}>Create User</Text>
            </TouchableOpacity>

            <Text style={{ color: "black", textAlign: "center" }}>
              Version: 2.1.0, Shaarif Khan
            </Text>
          </View>
        </KeyboardAvoidingView>
      );
    }
  }
}

const styles = StyleSheet.create({
  loading: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  ButtonTextStyle: {
    textAlign: "center",
    color: "#FFF",
    fontWeight: "700",
  },
  ButtonStyle: {
    backgroundColor: "rgba(1, 50, 67, 1)",
    paddingVertical: 15,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  TextInputStyle: {
    height: 40,
    backgroundColor: "rgba(82, 179, 217, 1)",
    marginBottom: 20,
    paddingHorizontal: 10,
    color: "rgba(36, 37, 42, 1)",
  },
  loginContainer: {
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(30, 139, 195, 1)",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    height: 250,
  },
  logoStyle: {
    justifyContent: "center",
    alignItems: "center",
    width: 250,
    height: 250,
  },
  TextStyle: {
    fontSize: 25,
    color: "rgba(1, 50, 67, 1)",
  },
});
