import React from 'react';
import { StyleSheet, Text, View,TouchableOpacity,Image,KeyboardAvoidingView, Alert} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import { TextInput } from 'react-native-gesture-handler';
import firebase from 'firebase';
import db from '../config';

export default class BookTransactionScreen extends React.Component {
  constructor(){
    super();
    this.state={
      hasCameraPermissions:null,
      scanned:false,
      scannedData:'',
      buttonState:'normal',
      scannedBookId:'',
      scannedStudentId:''
    }
  }
  getCameraPermissions=async()=>{
    const {status} = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermissions:status==="granted",
      buttonState:'clicked',
      scanned:false
    })
  }
  handleBarcodeScanned=async({type,data})=>{
    const {buttonState} = this.state;
    if(buttonState === "bookId"){
      this.setState({
        scanned:true,
        scannedBookId:data,
        buttonState:'normal'
      })
    }
    else if(buttonState === "studentId"){
    this.setState({
      scanned:true,
      scannedStudentId:data,
      buttonState:'normal'
    })
  }
}
  handleTransaction=async()=>{
    var transactionType=await this.checkBookEligibility();
    console.log(transactionType);
    if(!transactionType){
      Alert.alert("The Book doesn't exist in the database");
      this.setState({
        scannedStudentId:"",
        scannedBookId:""
      })
    }
    else if(transactionType === "Issue"){
      var isStudentEligible = await this.checkstudentEligibilityForBookIssue();
      if(isStudentEligible){
        this.initiateBookIssue();
        Alert.alert("Book Issued to the student");
      }
    }
    else{
      var isStudentEligible = await this.checkstudentEligibilityForBookReturn();
      if(isStudentEligible){
        this.initiateBookReturn();
        Alert.alert("Book Return to the student");
      } 
    }
    /*db.collection("Books").doc(this.state.scannedBookId).get()
    .then((doc)=>{
      var book=doc.data();
      if(book.bookAvailability){
        this.initiateBookIssue();
        transactionmessage="Book Issued";
      }
      else{
        this.initiateBookReturn();
        transactionmessage="Book Returned";
      }
    })
    this.setState({
      transactionmessage:transactionmessage
    })*/
  }
  checkBookEligibility=async()=>{
    const bookRef = await db.collection("Books").where("bookId","==",this.state.scannedBookId).get();
    var transactionType="";
    if(bookRef.docs.length === 0){
      transactionType=false;
    }
    else{
      bookRef.docs.map(doc=>{
        var book = doc.data();
        if(book.bookAvailability){
          transactionType="Issue";
        }
        else{
          transactionType="Return";
        }
      })
    }
    return transactionType;
  }
  checkstudentEligibilityForBookIssue=async()=>{
    const studentRef = await db.collection("Students").where("studentId","==",this.state.scannedStudentId).get();
    var isStudentEligible="";
    if(studentRef.docs.length===0){
      isStudentEligible=false;
      this.setState({
        scannedStudentId:"",
        scannedBookId:""
      })
      Alert.alert("Student Id doesn't exist in the datase");
    }
    else{
      studentRef.docs.map(doc=>{
        var student=doc.data();
        if(student.numberOfBooksIssued < 2){
          isStudentEligible=true;
        }
        else{
          isStudentEligible=false;
          Alert.alert("The student has already issued 2 books");
          this.setState({
            scannedBookId:"",
            scannedStudentId:""
          })
        }
      })
    }
    return isStudentEligible;
  }
  checkstudentEligibilityForBookReturn=async()=>{
    const transactionRef = await db.collection("Transaction").where("bookId","==",this.state.scannedBookId).limit(1).get();
    var isStudentEligible="";
    transactionRef.docs.map(doc=>{
      var lastBookTransaction = doc.data();
      if(lastBookTransaction.studentId === this.state.scannedStudentId){
        isStudentEligible = true;
      }
      else{
        isStudentEligible=false;
        Alert.alert("The book wasn't issued by the student");
        this.setState({
          scannedBookId:"",
          scannedStudentId:""
        })
      }
    })
    return isStudentEligible;
  }
  initiateBookIssue=async()=>{
    console.log("Something");
    db.collection("Transaction").add({
      'studentId':this.state.scannedStudentId,
      'bookId':this.state.scannedBookId,
      'data':firebase.firestore.Timestamp.now().toDate(),
      'transactionType':'Issue'
    })
    db.collection("Books").doc(this.state.scannedBookId).update({
      'bookAvailability':false
    })
    db.collection("Students").doc(this.state.scannedStudentId).update({
      'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
    })
    this.setState({
      scannedStudentId:'',
      scannedBookId:''
    })
  }
  initiateBookReturn=async()=>{
    db.collection("Transaction").add({
      'studentId':this.state.scannedStudentId,
      'bookId':this.state.scannedBookId,
      'data':firebase.firestore.Timestamp.now().toDate(),
      'transactionType':'Return'
    })
    db.collection("Books").doc(this.state.scannedBookId).update({
      'bookAvailabitity':true
    })
    db.collection("Students").doc(this.state.scannedStudentId).update({
      'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
    })
    this.setState({
      scannedStudentId:'',
      scannedBookId:''
    })
  }
    render(){
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;
      if(buttonState === "clicked" && hasCameraPermissions){

  return (
    <BarCodeScanner onBarCodeScanned = {scanned?undefined:this.handleBarcodeScanned} style={StyleSheet.absoluteFillObject}/>
  );
      }
      else if(buttonState === "normal")
      {
        return(
          <KeyboardAvoidingView style={styles.container} behavioUr="padding" enabled>
          <View style={styles.container}>
            <View>
              <Image source={require("../assets/booklogo.jpg")} style={{width:200,height:200}}/>
              <Text style={{textAlign:"center",fontSize:30}}>Wily</Text>
            </View>

            <View style={styles.inputView}>
              <TextInput style={styles.inputBox} placeholder="Book ID" onChangeText={text =>this.setState({scannedBookId:text})} value={this.state.scannedBookId}/>
              <TouchableOpacity style={styles.ScanButton} onPress={()=>{this.getCameraPermissions("bookId")}}>
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputView}>
              <TextInput style={styles.inputBox} placeholder="Student ID" onChangeText={text =>this.setState({scannedStudentId:text})} value={this.state.scannedStudentId}/>
              <TouchableOpacity style={styles.ScanButton} onPress={()=>{this.getCameraPermissions("studentId")}}>
                <Text style={styles.buttonText}>Scan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={async()=>{
                var transactionmessage = await this.handleTransaction();
                }}>
                  <Text style={styles.submitButtonText}>Submit</Text>
                  </TouchableOpacity>
            </View>

          <Text style={styles.displayText}>{hasCameraPermissions===true?this.state.scannedData:'Request Camera Permission'}</Text>
          <TouchableOpacity style={styles.ScanButton} onPress={this.getCameraPermissions}><Text>Scan QR Code</Text></TouchableOpacity>

          </View>
          </KeyboardAvoidingView>
        );
      }
    }
}
const styles=StyleSheet.create({
  container:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  },
  displayText:{
    fontSize:20,
    textDecorationLine:'underline'
  },
  ScanButton:{
    backgroundColor:'#2196F3',
    padding:10,
    margin:10
  },
  inputView:{
    flexDirection:'row',
    margin:20,
  },
  inputBox:{
    width:200,
    height:40,
    borderWidth:1.5,
    borderRightWidth:0,
    fontSize:20
  },
  ScanButton:{
    backgroundColor:'#66BB6A',
    width:50,
    borderWidth:1.5,
    borderLeftWidth:0
  },
  submitButton:{
    backgroundColor:"pink",
    width:100,
    height:50,
  },
  submitButtonText:{
    padding:10,
    textAlign:'center',
    fontSize:20,
    fontWeight:'bold',
    color:'black'
  }
  
})