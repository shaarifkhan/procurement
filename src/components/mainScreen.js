import React, { Component } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ToastAndroid,
  Picker,
  AsyncStorage,
  Keyboard,
} from "react-native";
import ListShow from "./ListShow";
import Order from "./Order";
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
} from "native-base";
import * as firebase from "firebase";
export default class MainScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      text: "",
      selected: false,
      amount: "",
      weight: "",
      rate: "",
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
    };
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
      "https://raw.githubusercontent.com/shaarifkhan/procurement/master/src/jsonData/userprocuredata%20.json"
    )
      .then((response) => response.json())
      .then((data) => {
        this.setState({ allData: data });
      });
  }
  getData() {
    fetch(
      "https://raw.githubusercontent.com/shaarifkhan/procurement/master/src/jsonData/procuredata.json"
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
      amount,
      weight,
      selected,
      rate,
      marketrate,
      comments,
      unit,
    } = this.state;
    this.setState((prevState) => {
      prevState.pList.push({
        amount: amount,
        weight: weight,
        selected: selected,
        rate: rate,
        marketrate: marketrate,
        comments: comments,
        uid: key,
        unit: unit,
        UserID: firebase.auth().currentUser.email,
      });
      return prevState;
    });

    this.setState({
      amount: "",
      weight: "",
      rate: "",
      marketrate: "",
      unit: "kgs",
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
    let { amount, weight, rate, selected, totalAmt } = this.state;

    if (amount == "" && weight != "" && rate != "") {
      let result = parseFloat(weight) * rate;
      result = result.toFixed(2);
      amount = "" + result;
    } else if (weight == "" && amount != "" && rate != "") {
      let result = parseFloat(amount) / rate;
      result = result.toFixed(2);
      weight = "" + result;
    } else if (rate == "" && amount != "" && weight != "") {
      let result = parseFloat(amount) / weight;
      result = result.toFixed(2);
      rate = "" + result;
    } else if (
      selected == "Bhaada" ||
      selected == "Palledari" ||
      selected == "Jalpan"
    ) {
      amount = amount;
      weight = "";
      rate = "";
    } else {
      return Alert.alert("Error", "Please check the data");
    }
    totalAmt = totalAmt + parseFloat(amount);
    this.setState({
      totalAmt,
    });
    console.log(totalAmt);
    this.setState(
      {
        amount,
        weight,
        rate,
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
      amount,
      weight,
      selected,
      rate,
      marketrate,
      comments,
      uid,
      allData,
      unit,
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
              <Icon type="FontAwesome" name="money" />
              <Input
                onChangeText={(amount) => this.setState({ amount })}
                value={amount}
                keyboardType="numeric"
                placeholder="Amount"
              />
            </Item>
            <Item>
              <Icon name="ios-pricetag" />
              <Input
                onChangeText={(rate) => this.setState({ rate })}
                value={rate}
                keyboardType="numeric"
                placeholder="Rate"
              />
            </Item>
            <Item style={{ flexDirection: "row" }}>
              <Icon type="MaterialCommunityIcons" name="weight-kilogram" />
              <Input
                onChangeText={(weight) => this.setState({ weight })}
                value={weight}
                keyboardType="numeric"
                placeholder="Weight"
              />
              <Item>
                <Picker
                  selectedValue={unit}
                  mode="dropdown"
                  style={{ height: 50, width: 150 }}
                  onValueChange={(itemValue, itemIndex) =>
                    this.setState({ unit: itemValue })
                  }
                >
                  <Picker.Item label="Kilograms" value="kg" />
                  <Picker.Item label="Dozens" value="dz" />
                  <Picker.Item label="Pieces" value="pcs" />
                </Picker>
              </Item>
            </Item>
            <Item>
              <Icon name="ios-pricetag" />
              <Input
                onChangeText={(marketrate) => this.setState({ marketrate })}
                value={marketrate}
                placeholder="Market Rate"
              />
            </Item>
            <Item>
              <Icon type="Ionicons" name="md-people" />
              <Picker
                style={{ height: 50, width: 340 }}
                mode="dropdown"
                placeholder="Choose from List.."
                selectedValue={this.state.comments}
                onValueChange={(itemValue, itemIndex) =>
                  this.setState({ comments: itemValue })
                }
              >
                {this.state.CommentsList.map((item, key) => {
                  return (
                    <Picker.Item
                      label={item.item}
                      value={item.value}
                      key={key}
                    />
                  );
                })}
              </Picker>
            </Item>
            <Item>
              <Icon name="ios-code-working" />
              <Input
                onChangeText={(comments) => this.setState({ comments })}
                value={comments}
                placeholder="If Others please specify"
              />
            </Item>
          </Content>
        </CardItem>

        <CardItem>
          <Content>
            <Button block info onPress={() => this.validator()}>
              <Text>Procure Item</Text>
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
        <ListShow
          authLevel={this.state.authLevel}
          list={this.state.pList}
          back={() => this.setState({ vList: false })}
          delete={(rowToDelete, amount) =>
            this.deleteListData(rowToDelete, amount)
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
              <Title>Procure Service</Title>
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
