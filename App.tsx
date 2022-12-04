/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import AsyncStorage  from '@react-native-community/async-storage';
import auth from '@react-native-firebase/auth';
import OTPAuth from "totp-generator"
import * as Base32 from "hi-base32"
import {Buffer} from 'buffer';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  TextInput,
  Button,
  ImageBackground,
} from 'react-native';
import {GoogleSignin} from '@react-native-community/google-signin';
import {RecoveryKit} from './components/src';
import { bool } from 'aws-sdk/clients/signer';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const getData = async (key: string) => {
    try {
      const Value = await AsyncStorage.getItem(key);
      return Value;
    } catch(e) {
      console.log(e);
    }
  }
  const img = {uri: "https://w0.peakpx.com/wallpaper/262/173/HD-wallpaper-samsung-background-blue-edge-gradient-gray-plain-purple-simple-sky.jpg"}
  const getKeys = async () => {
    try {
      return await AsyncStorage.getAllKeys();
    } catch(e) {
      console.log(e);
    }
  }

  const [authSecret, setauthSecret] = useState<{account_name: string, seed: string}>({account_name: "null", seed: "null"});
  const [authSecretarr, setauthSecretarr] = useState<{account_name: string, seed: string}[]>([{account_name:"ERROR", seed:"ERROR"}]);
  const [tabo, settabo] = useState<boolean>(false);

  const stubautharr = async () => {
    var keys = await getKeys();
    keys?.map(async (key)=>{
      var seed = await getData(key);
      console.log("key are ", key)
      console.log("ssed is ",seed);
      authSecretarr.push({account_name: key, seed:seed?seed:"ERROR"})
      console.log("secret arr is ", authSecretarr)
    })
  }
  useEffect(() => {
    // initialize the Google SDK
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive'],
      webClientId:
        '270854781378-vbch9dd41vbrgaujj5tp4jscvf8pi1a6.apps.googleusercontent.com',
    });
    stubautharr();
  }, []);

  const [token, setToken] = useState<string>('');
  const [otherShards, setOtherShards] = useState<string[]>([]);
  const [text, setText] = useState<string>('');
  const [numberOfShares, setN] = useState<number>(1);
  const [threshold, setT] = useState<number>(1);
  const [emaillist, setemail] = useState([{id: 1, email:''}]);
  const [pendingReq, setpendingReq] = useState<{Owner: string, RequestType: string, fileId: string, filename: string}[]>([]);

  const incN = () => {
    setN (numberOfShares + 1);
    setemail([...emaillist, {id: numberOfShares + 1, email:''}]);
  }

  const reset = () => {
    setN (1);
    setT (1);
    setemail([{id: 1, email:''}]);
  }

  const handlechange = (id: number, event:any) => {
    const newemail = emaillist.map(i=> {
      if (id === i.id) {
        i.email = event
      }
      return i;
    })
    setemail(newemail)
  }

  const delAcc = async () => {
    try {
      setauthSecretarr([{account_name:"ERROR", seed:"ERROR"}]);
      return await AsyncStorage.clear();
      } catch(e) {
        console.log(e);
      }
  }

  return (
    <View style={{top:0}}>
      <ImageBackground source={img} style={{height:"100%"}}>
      <StatusBar translucent={true}/>
        {token === '' ? (
          <TouchableOpacity
            style={[styles.buttonContainer, {backgroundColor: '#ffffff'}]}
            onPress={async () => {
              const {idToken} = await GoogleSignin.signIn();
              const googleCredential =
                auth.GoogleAuthProvider.credential(idToken);
              await GoogleSignin.hasPlayServices();
              await auth().signInWithCredential(googleCredential);
              const accessToken = (await GoogleSignin.getTokens()).accessToken;
              console.log(accessToken);
              setToken(accessToken);
              // setText('Google access token: ' + accessToken + " key is " + OTPAuth("NA6JPTZAV2IYTAPI"));
            }}>
            <View style={styles.btnTxtWrapper}>
              <Text style={[styles.buttonText, {color: '#de4d41'}]}>
                {'Sign-In'}
              </Text>
            </View>
          </TouchableOpacity>
        ): !tabo? (
          <>
          <View style={{flexDirection: "row"}}>
          <TouchableOpacity
            style={[styles.tabContainer, {backgroundColor: '#1B2430'}]}
            onPress={() => {
              settabo(true);
            }}>
            <View style={styles.btnTxtWrapper}>
              <Text style={[styles.buttonText, {color: '#EEEEEE'}]}>
                {'GUARDIANS'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabContainer, {backgroundColor: '#1B2430'}]}
            onPress={() => {
              settabo(false);
            }}>
            <View style={styles.btnTxtWrapper}>
              <Text style={[styles.buttonText, {color: '#EEEEEE'}]}>
                {'AUTHENTICATOR'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
            {
            <TextInput
              style={[styles.input,{marginTop: 48}]}
              placeholder="Account_name@Seed"
              keyboardType='email-address'
              onChangeText={event => {setauthSecret({account_name: event.split('@')[0], seed: event.split('@')[1]})}}
            />
            }

            <TouchableOpacity
              style={[styles.buttonContainer, {backgroundColor: '#ffffff'}]}
              onPress={async () => {
                let otps:string[] = [];
                if (authSecret.seed != "null"){
                  // otps.push(OTPAuth(authSecret.seed));
                  setauthSecretarr([...authSecretarr, {account_name:authSecret.account_name, seed:authSecret.seed}])
                  await AsyncStorage.setItem(authSecret.account_name, authSecret.seed);
                }
              }}>
              <View style={[styles.btnTxtWrapper]}>
                <Text style={[styles.buttonText, {color: '#de4d41'}]}>
                  {'Add account'}
                </Text>
              </View>
            </TouchableOpacity>
            {/* <View style={{marginTop:50}}></View> */}
            {
              authSecretarr
              .filter((obj) =>
               obj.seed != "ERROR"
              ).map((obj) =>
                (
                <View key={obj.seed} style={{paddingLeft:30,
                                              paddingRight:30, 
                                              
                                              shadowOpacity:0.3,
                                              shadowColor:'#171717',
                                              shadowOffset:{width: -2, height: 4},}}>
                  <Text key={obj.seed} style={{marginTop:"5%",
                                              borderStyle:"solid",
                                              backgroundColor:"#e8e0c3",
                                              
                                              borderRadius:25,
                                              padding:8,
                                              fontWeight:'bold',
                                              // height:"3%",
                                              }}>OTP for {obj.account_name} is {OTPAuth(obj.seed)}</Text>
                </View>
                )
              )
            }
            <View style={[styles.btnTxtWrapper, {marginTop: 10, bottom:0, position:"absolute", marginBottom:10, marginLeft:"25%"}]}>
            <Button
              title='Delete all accounts!'
              onPress={delAcc}/>
            </View>
            
          </>
        ):(
        <>
        <View style={{flexDirection: "row"}}>
          <TouchableOpacity
            style={[styles.tabContainer, {backgroundColor: '#1B2430'}]}
            onPress={() => {
              settabo(true);
            }}>
            <View style={styles.btnTxtWrapper}>
              <Text style={[styles.buttonText, {color: '#EEEEEE'}]}>
                {'GUARDIANS'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabContainer, {backgroundColor: '#1B2430'}]}
            onPress={() => {
              settabo(false);
            }}>
            <View style={styles.btnTxtWrapper}>
              <Text style={[styles.buttonText, {color: '#EEEEEE'}]}>
                {'AUTHENTICATOR'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View
              style = { {flexDirection: "row", justifyContent: 'space-evenly', marginTop:24} }>
              <Button
                title='N+'
                onPress={incN}/>
              <Button
                title='T+'
                onPress={()=>setT(threshold + 1)}/>
              <Button
                title='Reset'
                onPress={reset}/>
            </View>
            <View>
              <Text style = { {fontWeight: 'bold', alignContent: 'center'} }>N: {numberOfShares}, T: {threshold}</Text>
            </View>

            {emaillist.map((val) => (
              <TextInput key={val.id}
              style={styles.input}
              placeholder="Enter email address"
              keyboardType='email-address'
              textContentType='emailAddress'
              onChangeText={event=> {handlechange(val.id, event)}}
              />
            ))}

            <TouchableOpacity
              style={[styles.buttonContainer, {backgroundColor: '#ffffff'}]}
              onPress={
                async () =>
                {
                  var seed:string[] = [];
                  var accounts: string[] = [];
                  for (let i=0; i<authSecretarr.length; i++) {
                    if (authSecretarr[i].seed != "ERROR"){
                        accounts.push(authSecretarr[i].account_name);
                        seed.push(Buffer.from(Base32.decode.asBytes(authSecretarr[i].seed)).toString('hex'));
                      }
                  }
                  console.log("seed is " + seed + "\n" + "accounts is " + accounts);
                  const data = await RecoveryKit.upload({
                    drive: {
                      googleAccessToken:
                        token,
                    },
                    privateKey:
                      seed,
                    accounts:
                      accounts,
                    numberOfShares:
                      numberOfShares,
                    threshold:
                      threshold,
                    emailaddrs:
                      emaillist
                  })
                }
              }>
              <View style={styles.btnTxtWrapper}>
                <Text style={[styles.buttonText, {color: '#de4d41'}]}>
                  {'Send!'}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonContainer, {backgroundColor: '#ffffff'}]}
              onPress={async () => {
                const data: Boolean = await RecoveryKit.uploadRecollect({
                  drive: {
                    googleAccessToken: token,
                  },
                  emailaddrs: emaillist,
                });
                console.log('Recoverd using Drive + other part');
                // setText('Secret successfully recovered, secret: ' + data);
              }}>
              <View style={styles.btnTxtWrapper}>
                <Text style={[styles.buttonText, {color: '#de4d41'}]}>
                  {'Recollect!'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonContainer, {backgroundColor: '#ffffff'}]}
              onPress={async () => {
                const data = await RecoveryKit.recovery({
                  drive: {
                    googleAccessToken: token,
                  },
                  numberOfShares: numberOfShares,
                  threshold: threshold,
                  recoveryShards: otherShards,
                });
                let res = data;
                console.log("hex is ",data);
                console.log('Recoverd using Drive + other part', res);
                for (let i=0;i<res.secrets.length;i++) {
                  setauthSecretarr([...authSecretarr, {account_name:res.accounts[i], seed: 
                                                                                      Base32.encode(Buffer.from(res.secrets[i], 'hex'))}]);
                }
                setText('All accounts recovered!');
              }}>
              <View style={styles.btnTxtWrapper}>
                <Text style={[styles.buttonText, {color: '#de4d41'}]}>
                  {'Recover Accounts!'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonContainer, {backgroundColor: '#ffffff'}]}
              onPress={async () => {
                const data:{Owner:string, RequestType: string, fileId: string, filename: string}[] = await RecoveryKit.pending({
                  token: token
                });
                setpendingReq(data);
                setText("");
              }}>
              <View style={styles.btnTxtWrapper}>
                <Text style={[styles.buttonText, {color: '#de4d41'}]}>
                  {'Check Pending Requests'}
                </Text>
              </View>
            </TouchableOpacity>

            {
              pendingReq.map((obj)=>(
                <View key={obj.fileId} style={{marginTop:20}}>
                  <Text key={obj.fileId} style={{fontWeight:'bold'}}> {obj.Owner} {obj.RequestType} </Text>
                  <View style = { {flexDirection: "row", justifyContent: 'space-evenly'} }>
                    <Button title='Approve'
                      onPress={async () => {
                        const fileId:string = obj.fileId;
                        const filename: string = obj.filename;
                        await RecoveryKit.approve({token, fileId, filename, Owner:obj.Owner})
                        console.log("here2");
                        }
                      }></Button>
                  </View>
                </View>
              ))
            }
        </>)}
        <Text style={{height: '50%', width: '85%', margin: 20}}>{text}</Text>
        
      </ImageBackground>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 10,
    width: '70%',
    height: 50,
    // padding: 10,
    flexDirection: 'row',
    borderRadius: 15,
    alignItems: 'center',
    marginLeft: "15%",
    elevation:2
  },
  tabContainer: {
    // marginTop: 10,
    width: '50%',
    height: 50,
    // span: '50%',
    display: 'flex',
    flexDirection:'row',
    padding: 10,
    
    // flexDirection: 'row',
    borderRadius: 3,
  },
  btnTxtWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Lato-Regular',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    fontFamily: 'Lato-Regular',
    backgroundColor:'white',
    borderRadius:15,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    height: 200,
    width: 350,
  },
});
