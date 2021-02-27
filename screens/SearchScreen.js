import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList, ScrollView, TextInput } from 'react-native-gesture-handler';
import db from '../config';

export default class SearchScreen extends React.Component {
  constructor(){
    super();
    this.state={
      allTransactions:[],
      lastVisibleTransaction:null,
      search:''
    }
  }
  componentDidMount=async()=>{
    const query=await db.collection("Transaction").get();
    query.docs.map((doc)=>{
      this.setState({
        allTransactions:[this.state.allTransactions,doc.data()]
      })
    })
  }
  fetchMoreTransaction=async()=>{
    var text = this.state.search.toUpperCase();
    var enteredText=text.split("");
    if(enteredText[0].toUpperCase() === 'B'){
      const transaction=await db.collection("Transaction").where('bookId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get();
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[this.state.allTransactions,doc.data()],
          lastVisibleTransaction:doc
        })
     })
    }
    else if(enteredText[0].toUpperCase() === 'S'){
      const transaction=await db.collection("Transaction").where('studentId','==',text).startAfter(this.state.lastVisibleTransaction).limit(10).get();
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[this.state.allTransactions,doc.data()],
          lastVisibleTransaction:doc
        })
     })
    } 
  }
  searchTransactions=async(text)=>{
    var enteredText=text.split("");
    if(enteredText[0].toUpperCase() === 'B'){
      const transaction=await db.collection("Transcation").where('bookId','==',text).get();
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[this.state.allTransactions,doc.data()],
          lastVisibleTransaction:doc
        })
      })
    }
    else if(enteredText[0].toUpperCase() === 'S'){
      const transaction=await db.collection("Transcation").where('studentId','==',text).get();
      transaction.docs.map((doc)=>{
        this.setState({
          allTransactions:[this.state.allTransactions,doc.data()],
          lastVisibleTransaction:doc
        })
     })
  }
}
    render(){
  return(
    <View style={styles.container}>
      
      <View style={styles.searchBar}>
      <TextInput style={styles.bar} placeholder="Enter Book ID or Student ID " on onChangeText={(text)=>{this.setState({search:text})}}/>
      <TouchableOpacity style={styles.searchButton} onPress={()=>{this.searchTransactions(this.state.search)}}>
        <Text>
          Search
        </Text>
      </TouchableOpacity>
      </View>
      <FlatList data={this.state.allTransactions} renderItem={({item})=>(
        <View style={{flex:1,borderBottomWidth:2}}>
        <Text>{"Book ID : "+item.bookId}</Text>
        <Text>{"Student ID : "+item.studentId}</Text>
        <Text>{"Date : "+item.data}</Text>
        <Text>{"Transaction type : "+item.transactionType}</Text>
      </View>
    )}>
      keyExtractor={(item,index)=>index.toString()}
      onEndReached={this.fetchMoreTransaction}
      onEndReachedTreshold={0.7}
    </FlatList>
    </View>
  );
    }
}
const styles=StyleSheet.create({
  container:{
    flex:1,
    marginTop:20
  },
  SearchBar:{
    flexDirection:'row',
    height:40,
    width:'auto',
    borderWidth:0.5,
    alignItems:'center',
    backgroundColor:'grey'
  },
  bar:{
    borderWidth:2,
    height:30,
    width:300,
    paddingLeft:10
  },
  searchButton:{
    borderWidth:1,
    height:30,
    width:50,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'green'
  }
})