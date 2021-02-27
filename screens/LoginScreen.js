import * as React from 'react';
import {View,Text,StyleSheet,Image, KeyboardAvoidingView, TouchableOpacity} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import db from '../config';
import * as firebase from 'firebase';


export default class LoginScreen extends React.Component{
    constructor(){
        super();
        this.state={
            emailId:'',
            password:''
        }
    }
    login=async(emailId,password)=>{
    if(emailId && password){
        try{
            const response=await firebase.auth().signInWithEmailAndPassword(emailId,password);
            if(response){
                this.props.navigation.navigate(Transaction);
            }
            else{
                console.log("Checking");
            }
        }
        catch(error){
            console.log(error); 
            switch (error.code) 
            { 
                case 'auth/user-not-found': 
                    Alert.alert("user dosen't exists") ;
                    console.log("doesn't exist") ;
                    break; 
                case 'auth/invalid-email': 
                    Alert.alert('incorrect email or password') ;
                    console.log('invaild') 
                    break; 
            } }
    }
    }
    render(){
        return(
            <KeyboardAvoidingView style={{alignItems:'center',marginTop:30}}>
            <View>
            <View>
                <View>
                    <Image source={require("../assets/booklogo.jpg")} style={{width:200,height:200,alignItems:'center',justifyContent:'center'}}/>
                    <Text style={{textAlign:'center',fontSize:20}}>Wily</Text>
                </View>
                <TextInput style={styles.loginBox} placeholder="abc@gmail.com" keyboardType='email-address' onChangeText={(text)=>{this.setState({emailId:text})}}/>
                <TextInput style={styles.loginBox} placeholder="Enter Password" secureTextEntry={true} onChangeText={(text)=>{this.setState({password:text})}}/>
            </View>
            <View>
                <TouchableOpacity style={{height:30,width:90,borderWidth:1,marginTop:20}} onPress={()=>{this.login(this.state.emailId,this.state.password)}}>
                    <Text>Submit</Text>
                </TouchableOpacity>
            </View>
            </View>
            </KeyboardAvoidingView>
        );
    }
}
const styles=StyleSheet.create({
    loginBox:{
        width:300,
        height:40,
        borderWidth:1.5,
        fontSize:20,
        margin:10,
        paddingLeft:10,
    }
});