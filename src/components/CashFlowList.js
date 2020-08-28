import React, { Component } from "react";
import {
  View,
  ListView,
  ListViewDataSource,
  StyleSheet,
  TouchableOpacity,
  InteractionManager,
  RefreshControl,
  Animated,
  Dimensions,
  ToastAndroid,
  BackHandler,
  Platform,
  Alert,
} from "react-native";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Left,
  Right,
  Body,
  Icon,
  Text,
  FooterTab,
  Footer,
  Badge,
  Toast,
  ActionSheet,
} from "native-base";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import firebase from "firebase";
const window = Dimensions.get("window");

class DynamicListRow extends Component {
  _defaultHeightValue = 60;
  _defaultTransition = 500;

  state = {
    _rowHeight: new Animated.Value(this._defaultHeightValue),
    _rowOpacity: new Animated.Value(0),
  };

  componentDidMount() {
    Animated.timing(this.state._rowOpacity, {
      toValue: 1,
      duration: this._defaultTransition,
    }).start();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.remove) {
      this.onRemoving(nextProps.onRemoving);
    } else {
      this.resetHeight();
    }
  }

  onRemoving(callback) {
    Animated.timing(this.state._rowHeight, {
      toValue: 0,
      duration: this._defaultTransition,
    }).start(callback);
  }

  resetHeight() {
    Animated.timing(this.state._rowHeight, {
      toValue: this._defaultHeightValue,
      duration: 0,
    }).start();
  }

  render() {
    return (
      <Animated.View
        style={{
          height: this.state._rowHeight,
          opacity: this.state._rowOpacity,
        }}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}

export default class DynamicList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      dataSource: new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      }),
      refreshing: false,
      rowToDelete: null,
      sheet: true,
      num: 0,
      clicked: 0,
      authLevel: "",
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
        for (var i = 0; i <= data.length; i++) {
          if (data[i].email == userID) return data[i].auth;
        }
      });
  }
  componentWillMount() {
    let that = this;
    that.getauthLevel();
    firebase
      .database()
      .ref("orders/")
      .on("value", function (snapshot) {
        let data = snapshot.val();
        if (data == null) {
          that.setState({
            num: 0,
          });
        } else {
          let num = Object.keys(snapshot.val()).length;
          that.setState({
            num: num,
          });
        }
      });
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this._loadData();
    });
  }

  _loadData(refresh) {
    refresh &&
      this.setState({
        refreshing: true,
      });

    this.dataLoadSuccess({
      data: this.props.list,
    });
  }

  dataLoadSuccess(result) {
    this._data = result.data;

    let ds = this.state.dataSource.cloneWithRows(this._data);

    this.setState({
      loading: false,
      refreshing: false,
      rowToDelete: -1,
      dataSource: ds,
    });
    console.log(this._data);
    this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      this.props.navigation.navigate("MainScreen");
      return true;
    });
  }
  async createPDF(data) {
    var totalAmount = Math.round(this.props.total, 3);
    var today = new Date();
    var date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate() +
      "-" +
      today.getHours() +
      "-" +
      today.getMinutes() +
      "-" +
      today.getSeconds();
    var mytable =
      "<html><body><h1>Transaction Report - Dated = " +
      date +
      '</h1><table cellpadding="5" cellspacing="5"><thead><td>Bill Date</td><td>Customer Name</td><td>Payment Status</td><td>Payment Mode</td><td>Bill Amount</td><td>Paid Amount</td><td>Pending Amount</td><td>Remarks</td></thead><tbody>';
    for (var i = 0; i < data.length; i++) {
      mytable += "<tr>";
      mytable += "<td>" + data[i].chosenDate + "</td>";
      mytable += "<td>" + data[i].selected + "</td>";
      mytable += "<td>" + data[i].payStat + "</td>";
      mytable += "<td>" + data[i].paymentMode + "</td>";
      mytable += "<td>" + data[i].billamount + "</td>";
      mytable += "<td>" + data[i].payAmount + "</td>";
      mytable += "<td>" + data[i].pendingAmount + "</td>";
      mytable += "<td>" + data[i].remarks + "</td>";
      mytable += "<tr>";
    }
    mytable +=
      "<td></td><td></td><td> Total Bill Amount: Rs. " +
      totalAmount +
      "</td><tr></tbody></table></body></html>";
    let options = {
      html: mytable,
      fileName: "TransactionReport" + date,
      directory: "docs",
    };

    let pdf = await RNHTMLtoPDF.convert(options);
    ToastAndroid.show("Report saved at:" + pdf.filePath, ToastAndroid.LONG);
  }

  render() {
    let actionOptions;

    actionOptions = [
      { text: "Order Details", icon: "ios-cart", iconColor: "red" },
      { text: "Procurement Details", icon: "aperture", iconColor: "blue" },
      { text: "Cash Flow Management", icon: "ios-barcode", iconColor: "green" },
      { text: "LeftOver Inventory", icon: "ios-filing", iconColor: "black" },
      { text: "Customer Bills", icon: "analytics", iconColor: "purple" },
    ];

    if (this.state.sheet) {
      return (
        <Container>
          <Header
            iosStatusbar="light-content"
            androidStatusBarColor="rgba(1, 50, 67, 1)"
            style={{ backgroundColor: "rgba(1, 50, 67, 1)" }}
          >
            <Left>
              <Button transparent onPress={() => this.props.back()}>
                <Icon name="arrow-back" />
              </Button>
            </Left>
            <Body>
              <Title>Transaction List</Title>
            </Body>
            <Right />
          </Header>
          <Content
            style={{
              padding: 10,
            }}
          >
            <View style={styles.addPanel}>
              <Text style={{ paddingBottom: 5 }}>
                Following list is editabe, you can use 'Add to Sheets' for final
                submission.
              </Text>
              <Right>
                <Text style={{ paddingBottom: 20, fontSize: 22 }}>
                  Bill Total: Rs. {this.props.total}
                </Text>
              </Right>
              <Button block danger onPress={() => this.addData()}>
                <Text style={styles.addButtonText}>Add to Sheets</Text>
              </Button>
            </View>
            <ListView
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this._loadData.bind(this, true)}
                  tintColor="#00AEC7"
                  title="Loading..."
                  titleColor="#00AEC7"
                  colors={["#FFF", "#FFF", "#FFF"]}
                  progressBackgroundColor="#00AEC7"
                />
              }
              enableEmptySections={true}
              dataSource={this.state.dataSource}
              renderRow={this._renderRow.bind(this)}
            />
          </Content>
        </Container>
      );
    } else {
      return (
        <Container>
          <Header
            iosStatusbar="light-content"
            androidStatusBarColor="rgba(1, 50, 67, 1)"
            style={{ backgroundColor: "rgba(1, 50, 67, 1)" }}
          >
            <Left>
              <Button transparent onPress={() => this.props.back()}>
                <Icon name="arrow-back" />
              </Button>
            </Left>
            <Body>
              <Title>Transaction List</Title>
            </Body>
            <Right />
          </Header>
          <Content
            style={{
              padding: 5,
            }}
          >
            <View style={styles.addPanel}>
              <Text style={{ paddingBottom: 20 }}>
                Your data has been added to the database, Please start a new
                session.
              </Text>

              <Button disabled>
                <Text style={styles.addButtonText}>Add to Sheets</Text>
              </Button>
            </View>
          </Content>
        </Container>
      );
    }
  }

  _renderRow(rowData, sectionID, rowID) {
    return (
      <DynamicListRow
        remove={rowData.uid === this.state.rowToDelete}
        onRemoving={this._onAfterRemovingElement.bind(this)}
      >
        <View style={styles.rowStyle}>
          <View style={styles.contact}>
            <Text style={[styles.name]}>{rowData.selected}</Text>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.phone}>Date: {rowData.billDate} |</Text>
              <Text style={styles.phone}>Status : {rowData.payStat} |</Text>
              <Text style={styles.phone}>Mode: {rowData.paymentMode} |</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.phone}>Bill: {rowData.billamount} Rs. </Text>
              <Text style={styles.phone}>Paid: {rowData.payAmount} Rs. |</Text>
              <Text style={styles.phone}>
                Pending: {rowData.pendingAmount} Rs.{" "}
              </Text>
              <Text style={styles.phone}>Remarks: {rowData.remarks} </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.deleteWrapper}
            onPress={() => this._deleteItem(rowData.uid, rowData.billamount)}
          >
            <Icon name="md-remove-circle" style={styles.deleteIcon} />
          </TouchableOpacity>
        </View>
      </DynamicListRow>
    );
  }
  addData() {
    var formData = new FormData();
    formData.append("values", JSON.stringify(this._data));
    fetch(
      "https://script.google.com/macros/s/AKfycbwP0uGZlsRpVqrEpXz36v8B_BVJAlwgUwWsoTYLImotXjrFxXoX/exec",
      {
        mode: "no-cors",
        method: "post",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      }
    )
      .then(function (response) {
        ToastAndroid.show("Updated" + response, ToastAndroid.SHORT);
      })
      .catch(console.log);
    this.createPDF(this._data);
    this.setState({
      sheet: false,
    });
    this.props.newSession();
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.rowToDelete !== null) {
      this._data = this._data.filter((item) => {
        if (item.uid !== nextState.rowToDelete) {
          return item;
        }
      });
      this.setState({
        rowToDelete: null,
        dataSource: this.state.dataSource.cloneWithRows(this._data),
      });
    }
  }

  _deleteItem(id, billamount) {
    this.setState({
      rowToDelete: id,
    });
    this.props.delete(id, billamount);
  }

  _onAfterRemovingElement() {}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  noData: {
    color: "#000",
    fontSize: 18,
    alignSelf: "center",
    top: 200,
  },

  addPanel: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#F9F9F9",
  },
  addButton: {
    backgroundColor: "#0A5498",
    width: 120,
    alignSelf: "flex-end",
    marginRight: 10,
    padding: 5,
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    alignSelf: "center",
  },

  rowStyle: {
    backgroundColor: "#FFF",
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    flexDirection: "row",
  },

  rowIcon: {
    width: 30,
    alignSelf: "flex-start",
    marginHorizontal: 10,
    fontSize: 24,
  },

  name: {
    fontWeight: "600",
    color: "#212121",
    fontSize: 14,
  },
  phone: {
    color: "#212121",
    fontSize: 12,
  },
  contact: {
    width: window.width - 100,
    alignSelf: "flex-start",
  },

  dateText: {
    fontSize: 10,
    color: "#ccc",
    marginHorizontal: 10,
  },
  deleteWrapper: {
    paddingVertical: 2,
    width: 80,
    alignSelf: "flex-end",
  },
  deleteIcon: {
    fontSize: 24,
    color: "#DA281C",
    alignSelf: "center",
  },
});
