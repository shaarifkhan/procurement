import React, { Component } from "react";
import LoginForm from "./components/LoginForm";
import * as firebase from "firebase";
import { Root } from "native-base";

export default class App extends Component {
  componentWillMount() {
    const firebaseConfig = {
      apiKey: "AIzaSyB8ua4l6iNqXT7YEKlego6FmpTcioASlZA",
      authDomain: "procure-b3770.firebaseapp.com",
      databaseURL: "https://procure-b3770.firebaseio.com",
      projectId: "procure-b3770",
      storageBucket: "procure-b3770.appspot.com",
      messagingSenderId: "1065488977040",
    };
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
  }
  componentDidMount() {}

  render() {
    return (
      <Root>
        <LoginForm />
      </Root>
    );
  }
}
