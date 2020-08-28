import React, { Component } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ToastAndroid,
  Picker,
  AsyncStorage,
  View,
  Keyboard,
} from "react-native";
import CashFlowList from "./CashFlowList";
import Autocomplete from "react-native-autocomplete-input";
import {
  Container,
  Header,
  Title,
  Content,
  Card,
  CardItem,
  Button,
  Item,
  Input,
  Left,
  Right,
  Body,
  Icon,
  Text,
  Subtitle,
  DatePicker,
} from "native-base";
import * as firebase from "firebase";
export default class Order extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      text: "",
      selected: false,
      billamount: "",
      payAmount: "",
      pendingAmount: "",
      marketrate: "",
      totalAmt: 0,
      comments: "",
      pList: [],
      vList: false,
      orderList: false,
      num: 0,
      allData: [],
      unit: "kgs",
      CommentsList: [],
      authLevel: "",
      authUser: "",
      chosenDate: new Date(),
    };

    this.setDate = this.setDate.bind(this);
  }

  setDate(newDate) {
    this.setState({ chosenDate: newDate });
  }
  getauthLevel() {
    let authUserID = firebase.auth().currentUser.email;
    result = this.getUserLevelData(authUserID);
    if (result == "admin") {
      this.setState({ authLevel: "admin" });
    } else if (result == "operator") {
      this.setState({ authLevel: "operator" });
    }
  }
  getUserLevelData(userID) {
    fetch(
      "https://raw.githubusercontent.com/shaarifkhan/procurement/master/src/jsonData/userAuthLevel.json"
    )
      .then((response) => response.json())
      .then((data) => {
        for (var i = 0; i < data.length; i++) {
          if (data[i].email == userID) return data[i].auth;
          break;
        }
      });
  }

  getUserSpecificData() {
    fetch(
      "https://raw.githubusercontent.com/shaarifkhan/procurement/master/src/jsonData/userprocuredata.json"
    )
      .then((response) => response.json())
      .then((data) => {
        this.setState({ allData: data });
      });
  }
  getData() {
    fetch(
      "https://raw.githubusercontent.com/shaarifkhan/procurement/master/src/jsonData/userprocuredata%20.json"
    )
      .then((response) => response.json())
      .then((data) => {
        this.setState({ allData: data });
      });
  }
  getCommentsData() {
    fetch(
      "https://raw.githubusercontent.com/shaarifkhan/procurement/master/src/jsonData/commentsData.json"
    )
      .then((response) => response.json())
      .then((data) => {
        this.setState({ CommentsList: data });
      });
  }

  componentWillMount() {
    /*this.getauthLevel();*/
    /*if(this.state.authLevel=='admin'){*/
    this.getData();
    this.timer = setInterval(
      () => this.getData(),
      100000
    ); /*}
		else if(this.state.authLevel=='operator'){
		this.getUserLevelData();
		this.timeruser = setInterval(()=> this.getUserLevelData(), 100000);}*/
    this.getCommentsData();

    this.timerComments = setInterval(() => this.getCommentsData(), 100000);
  }

  addtoList() {
    let key = Math.random().toString(36).substr(2);

    const {
      pendingAmount,
      payAmount,
      billamount,
      comments,
      remarks,
      paymentMode,
      allData,
      payStat,
      selected,
      chosenDate,
    } = this.state;
    this.setState((prevState) => {
      prevState.pList.push({
        billamount: billamount,
        pendingAmount: pendingAmount,
        selected: selected,
        payAmount: payAmount,
        payStat: payStat,
        comments: comments,
        remarks: remarks,
        uid: key,
        paymentMode: paymentMode,
        billDate: chosenDate.toString().substr(4, 12),
        UserID: firebase.auth().currentUser.email,
      });
      return prevState;
    });

    this.setState({
      billamount: "",
      pendingAmount: "",
      payAmount: "",
      remarks: "",
      comments: "",
      paymentMode: 0,
      payStat: 0,
    });
    ToastAndroid.show("Updated", ToastAndroid.SHORT);
    Keyboard.dismiss();
  }
  deleteListData(rowToDelete, amount) {
    let { totalAmt } = this.state;
    this.setState((prevState) => {
      prevState.pList = prevState.pList.filter((dataname) => {
        if (dataname.uid !== rowToDelete) {
          return dataname;
        } else {
          prevState.totalAmt = prevState.totalAmt - parseFloat(amount);
        }
      });
      return prevState;
    });
  }

  showList() {
    return <ListShow />;
  }

  validator() {
    let {
      pendingAmount,
      payAmount,
      billamount,
      selected,
      totalAmt,
    } = this.state;

    if (pendingAmount == "" && payAmount != "" && billamount != "") {
      let result = parseFloat(billamount) - parseFloat(payAmount);
      result = result.toFixed(2);
      pendingAmount = "" + result;
    } else if (payAmount == "" && pendingAmount != "" && billamount != "") {
      let result = parseFloat(billamount) - parseFloat(pendingAmount);
      result = result.toFixed(2);
      payAmount = "" + result;
    } else if (billamount == "" && payAmount != "" && pendingAmount != "") {
      let result = parseFloat(payAmount) + parseFloat(pendingAmount);
      result = result.toFixed(2);
      billamount = "" + result;
    } else {
      return Alert.alert("Error", "Please check the data");
    }
    totalAmt = totalAmt + parseFloat(billamount);
    this.setState({
      totalAmt,
    });
    console.log(totalAmt);
    this.setState(
      {
        billamount,
        payAmount,
        pendingAmount,
      },
      () => this.addtoList()
    );
  }
  logout() {
    firebase
      .auth()
      .signOut()
      .then(
        function () {
          // Sign-out successful.
        },
        function (error) {
          Alert.alert("Error", "Temporary Error, 400");
        }
      );
  }
  newSession() {
    this.setState({
      pList: [],
    });
  }

  renderSelected(item) {
    const {
      pendingAmount,
      payAmount,
      billamount,
      comments,
      remarks,
      paymentMode,
      allData,
      payStat,
    } = this.state;
    if (!!!item) {
      return null;
    }
    item = allData.filter((e) => e.label == item)[0];
    return (
      <Card>
        <CardItem cardBody>
          <Image source={{ uri: item.image }} style={style.cardImage} />
        </CardItem>
        <CardItem>
          <Left>
            <Text style={style.inputTextStyle}>{item.label}</Text>
          </Left>
        </CardItem>
        <CardItem cardBody>
          <Content
            style={{
              padding: 10,
              borderTopWidth: 1,
              borderColor: "#dadada",
            }}
          >
            <Item>
              <Icon type="MaterialIcons" name="date-range" />
              <DatePicker
                minimumDate={new Date(2015, 1, 1)}
                maximumDate={new Date(2025, 12, 31)}
                locale={"en"}
                timeZoneOffsetInMinutes={undefined}
                modalTransparent={false}
                animationType={"fade"}
                androidMode={"default"}
                placeHolderText="Select Bill Date"
                textStyle={{ color: "black" }}
                placeHolderTextStyle={{ color: "#d3d3d3" }}
                onDateChange={this.setDate}
              />
            </Item>
            <Item>
              <Icon name="ios-pricetag" />
              <Picker
                selectedValue={payStat}
                mode="dropdown"
                style={{ height: 50, width: 345 }}
                onValueChange={(itemValue, itemIndex) =>
                  this.setState({ payStat: itemValue })
                }
              >
                <Picker.Item label="Payment Status" value="0" />
                <Picker.Item label="Full Payment" value="full" />
                <Picker.Item label="Pending" value="pending" />
                <Picker.Item label="Partial Payment" value="partial" />
              </Picker>
            </Item>
            <Item>
              <Icon type="MaterialIcons" name="payment" />
              <Picker
                selectedValue={paymentMode}
                mode="dropdown"
                placeholder="Payment Mode"
                style={{ height: 50, width: 340 }}
                onValueChange={(itemValue, itemIndex) =>
                  this.setState({ paymentMode: itemValue })
                }
              >
                <Picker.Item label="Payment Mode" value="0" />
                <Picker.Item label="Cash" value="cash" />
                <Picker.Item label="Wallet" value="wallet" />
                <Picker.Item label="Bank Transfer" value="banktransfer" />
              </Picker>
            </Item>
            <Item>
              <Icon type="MaterialCommunityIcons" name="cash-multiple" />
              <Input
                onChangeText={(billamount) => this.setState({ billamount })}
                value={billamount}
                keyboardType="numeric"
                placeholder="Bill Amount"
              />
            </Item>
            <Item>
              <Icon type="MaterialCommunityIcons" name="cash-usd" />
              <Input
                onChangeText={(payAmount) => this.setState({ payAmount })}
                value={payAmount}
                keyboardType="numeric"
                placeholder="Paid Amount"
              />
            </Item>
            <Item>
              <Icon type="MaterialCommunityIcons" name="cash-100" />
              <Input
                onChangeText={(pendingAmount) =>
                  this.setState({ pendingAmount })
                }
                value={pendingAmount}
                keyboardType="numeric"
                placeholder="Pending Amount"
              />
            </Item>
            <Item>
              <Icon type="FontAwesome" name="comment" />
              <Input
                onChangeText={(remarks) => this.setState({ remarks })}
                value={remarks}
                placeholder="Remarks"
              />
            </Item>
          </Content>
        </CardItem>

        <CardItem>
          <Content>
            <Button block info onPress={() => this.validator()}>
              <Text>Add Transaction</Text>
            </Button>
          </Content>
        </CardItem>
        <CardItem>
          <Content
            style={{
              padding: 10,
              borderTopWidth: 1,
              borderColor: "#dadada",
            }}
          >
            <Button block danger onPress={() => this.setState({ vList: true })}>
              <Text>Generate Report</Text>
            </Button>
          </Content>
        </CardItem>
      </Card>
    );
  }
  render() {
    if (this.state.orderList) {
      return (
        <Order
          back={() => this.setState({ orderList: false })}
          list={this.state.pList}
          number={this.state.num}
        />
      );
    } else if (this.state.vList) {
      return (
        <CashFlowList
          authLevel={this.state.authLevel}
          list={this.state.pList}
          back={() => this.setState({ vList: false })}
          delete={(rowToDelete, billamount) =>
            this.deleteListData(rowToDelete, billamount)
          }
          total={this.state.totalAmt}
          newSession={() => this.setState({ pList: [], totalAmt: 0 })}
        />
      );
    } else {
      const { text, selected, allData } = this.state;
      let data = [];
      if (text.length) {
        data = allData
          .filter((e) => e.label.toLowerCase().startsWith(text.toLowerCase()))
          .map((e) => e.label);
      }
      return (
        <Container>
          <Header
            iosStatusbar="light-content"
            androidStatusBarColor="rgba(1, 50, 67, 1)"
            style={{ backgroundColor: "rgba(1, 50, 67, 1)" }}
          >
            <Body>
              <Title>Cash Flow Manage</Title>
              <Subtitle>Meri Mandi</Subtitle>
            </Body>
            <Right>
              <Button hasText transparent onPress={this.logout}>
                <Text>
                  {" "}
                  <Icon
                    style={{ color: "white", fontSize: 16 }}
                    type="Entypo"
                    name="log-out"
                  />{" "}
                  Logout
                </Text>
              </Button>
            </Right>
          </Header>
          <Content
            style={{
              padding: 10,
            }}
          >
            <Autocomplete
              style={{ height: 45 }}
              data={data}
              onChangeText={(text) => text && this.setState({ text })}
              renderItem={(item) => (
                <TouchableOpacity
                  onPress={() => this.setState({ text: item, selected: item })}
                >
                  <Text style={style.inputTextStyle}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            {this.renderSelected(selected)}
          </Content>
        </Container>
      );
    }
  }
}
const style = StyleSheet.create({
  listText: {
    fontSize: 14,
  },
  timeStampStyle: {
    fontSize: 16,
  },
  inputTextStyle: {
    fontSize: 22,
  },
  cardImage: {
    height: 200,
    width: null,
    flex: 1,
  },
});
