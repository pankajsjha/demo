require('dotenv').config();
const express= require('express');
const parser = require('body-parser');
const eWeLink= require('ewelink-api-next').default;
const fs = require('fs');


const app = express();
app.use(parser.json())

const PORT=  process.env.PORT||3000;
const redirectUrl = 'http://127.0.0.1:3000/redirectUrl' // Redirect URL, which needs to be configured in the eWeLeLink open platform
const randomString = (length) => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const maxPos = chars.length
    let pwd = ''
    for (let i = 0; i < length; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * maxPos))
    }
    return pwd
  }
  




const _config = {
    appId: 'kijTaN3TemXX13t3MQ7MOKDO0yijjfOB', // App ID, which needs to be configured in the eWeLink open platform
    appSecret: 'GPT2FSrt7Og73RduLyLVkCnblqyJuUeS', // App Secret, which needs to be configured in the eWeLink open platform
    region: 'as', //Feel free, it will be automatically updated after login
    requestRecord: true, // Request record, default is false
    // logObj: console, // Log object, default is console
  }
  const client = new eWeLink.WebAPI(_config)

app.get("/",(req,res)=>{
    res.send("Ok")
})

app.get("/login",async (req,res)=>{
    const loginUrl = await client.oauth.createLoginUrl({
        redirectUrl: redirectUrl,
        grantType: 'authorization_code',
        state: randomString(10),
      })
      // Automatically redirect to login URL
      res.redirect(loginUrl)


})

app.get('/status',async(req,res)=>{
    // If the file does not exist, directly report an error
    if (!fs.existsSync('./token.json')) {
      throw new Error('token.json not found, please run login.js first')
    }
  
    // get token
    let LoggedInfo = JSON.parse(fs.readFileSync('./token.json', 'utf-8'))
    // console.info(LoggedInfo)
    client.at = LoggedInfo.data?.accessToken
    client.region = LoggedInfo?.region || 'eu'
    client.setUrl(LoggedInfo?.region || 'eu')
    // Check if the token has expired, and refresh the token if it has expired
    if (
      LoggedInfo.data?.atExpiredTime < Date.now() &&
      LoggedInfo.data?.rtExpiredTime > Date.now()
    ) {
      console.log('Token expired, refreshing token')
      const refreshStatus = await client.user.refreshToken({
        rt: LoggedInfo.data?.refreshToken,
      })
      console.log(refreshStatus)
      if (refreshStatus.error === 0) {
        // You can also use built-in storage
        // client.storage.set('token', {...})
        fs.writeFileSync(
          './token.json',
          JSON.stringify({
            status: 200,
            responseTime: 0,
            error: 0,
            msg: '',
            data: {
              accessToken: refreshStatus?.data?.at,
              atExpiredTime: Date.now() + 2592000000,
              refreshToken: refreshStatus?.data?.rt,
              rtExpiredTime: Date.now() + 5184000000,
            },
            region: client.region,
          })
        )
        LoggedInfo = JSON.parse(fs.readFileSync('./token.json', 'utf-8'))
      }
    }
  
    if (LoggedInfo.data?.rtExpiredTime < Date.now()) {
      console.log('Failed to refresh token, need to log in again to obtain token')
      return
    }
  
    // Get device list
    try {
      let thingList = await client.device.getAllThingsAllPages({}) // { status: 200, error: 0, msg: "", data: { thingList: [{ itemType: 1, itemData: {...} }], total: 1 } };
    console.log(thingList)
    if (req.query.id){
   const device= thingList.data.thingList.find((x)=>x.itemData.deviceid==req.query.id)
   const sr = req.query.sr||0; 
   console.log(JSON.stringify(thingList.data.thingList[sr].itemData))
res.send({deviceid:device.itemData.deviceid, status:device.itemData.params.switches.map((x)=>x.switch)});
 return true
    } 
    const sr = req.query.sr||0; 
    console.log(JSON.stringify(thingList.data.thingList[sr].itemData))
res.send({sr:sr,deviceid:thingList.data.thingList[sr].itemData.deviceid, status:thingList.data.thingList[sr].itemData.params.switches.map((x)=>x.switch)});
  
//res.send(thingList)

    } catch (e) {
      console.log(e)
    }
  
  })
  
app.get('/switchOn',async(req,res)=>{
    // If the file does not exist, directly report an error
    if (!fs.existsSync('./token.json')) {
      throw new Error('token.json not found, please run login.js first')
    }
  
    // get token
    let LoggedInfo = JSON.parse(fs.readFileSync('./token.json', 'utf-8'))
    // console.info(LoggedInfo)
    client.at = LoggedInfo.data?.accessToken
    client.region = LoggedInfo?.region || 'eu'
    client.setUrl(LoggedInfo?.region || 'eu')
    // Check if the token has expired, and refresh the token if it has expired
    if (
      LoggedInfo.data?.atExpiredTime < Date.now() &&
      LoggedInfo.data?.rtExpiredTime > Date.now()
    ) {
      console.log('Token expired, refreshing token')
      const refreshStatus = await client.user.refreshToken({
        rt: LoggedInfo.data?.refreshToken,
      })
      console.log(refreshStatus)
      if (refreshStatus.error === 0) {
        // You can also use built-in storage
        // client.storage.set('token', {...})
        fs.writeFileSync(
          './token.json',
          JSON.stringify({
            status: 200,
            responseTime: 0,
            error: 0,
            msg: '',
            data: {
              accessToken: refreshStatus?.data?.at,
              atExpiredTime: Date.now() + 2592000000,
              refreshToken: refreshStatus?.data?.rt,
              rtExpiredTime: Date.now() + 5184000000,
            },
            region: client.region,
          })
        )
        LoggedInfo = JSON.parse(fs.readFileSync('./token.json', 'utf-8'))
      }
    }
  
    if (LoggedInfo.data?.rtExpiredTime < Date.now()) {
      console.log('Failed to refresh token, need to log in again to obtain token')
      return
    }
  
    // Get device list
    try {
  
     const id="10015aa87c";
     await client.device.setThingStatus({
      type: 1,
      id: id,
      params: {
        switches: [
          { switch: 'on', outlet: 0 },
          { switch: 'on', outlet: 1 },
          { switch: 'on', outlet: 2 },
          { switch: 'on', outlet: 3 },
        ],
      },
    })
   res.redirect("/status")
    } catch (e) {
      console.log(e)
    }

  
  })


  app.get('/setStatus',async(req,res)=>{
    // If the file does not exist, directly report an error
    if (!fs.existsSync('./token.json')) {
      throw new Error('token.json not found, please run login.js first')
    }
  
    // get token
    let LoggedInfo = JSON.parse(fs.readFileSync('./token.json', 'utf-8'))
    // console.info(LoggedInfo)
    client.at = LoggedInfo.data?.accessToken
    client.region = LoggedInfo?.region || 'eu'
    client.setUrl(LoggedInfo?.region || 'eu')
    // Check if the token has expired, and refresh the token if it has expired
    if (
      LoggedInfo.data?.atExpiredTime < Date.now() &&
      LoggedInfo.data?.rtExpiredTime > Date.now()
    ) {
      console.log('Token expired, refreshing token')
      const refreshStatus = await client.user.refreshToken({
        rt: LoggedInfo.data?.refreshToken,
      })
      console.log(refreshStatus)
      if (refreshStatus.error === 0) {
        // You can also use built-in storage
        // client.storage.set('token', {...})
        fs.writeFileSync(
          './token.json',
          JSON.stringify({
            status: 200,
            responseTime: 0,
            error: 0,
            msg: '',
            data: {
              accessToken: refreshStatus?.data?.at,
              atExpiredTime: Date.now() + 2592000000,
              refreshToken: refreshStatus?.data?.rt,
              rtExpiredTime: Date.now() + 5184000000,
            },
            region: client.region,
          })
        )
        LoggedInfo = JSON.parse(fs.readFileSync('./token.json', 'utf-8'))
      }
    }
  
    if (LoggedInfo.data?.rtExpiredTime < Date.now()) {
      console.log('Failed to refresh token, need to log in again to obtain token')
      return
    }
  
    // Get device list
    try {
  

        const id = req.query.id;
        const status = req.query.status;
        const setStatus= status.split(",").map((x,i)=>{return {switch:x,outlet:i}});
        
//     const id="10015aa87c";
     await client.device.setThingStatus({
      type: 1,
      id: id,
      params: {
        switches: setStatus,
      },
    })
   res.redirect("/status?id="+id)
    } catch (e) {
      console.log(e)
    }

  
  })

  
  app.get('/switchOff',async(req,res)=>{
    // If the file does not exist, directly report an error
    if (!fs.existsSync('./token.json')) {
      throw new Error('token.json not found, please run login.js first')
    }
  
    // get token
    let LoggedInfo = JSON.parse(fs.readFileSync('./token.json', 'utf-8'))
    // console.info(LoggedInfo)
    client.at = LoggedInfo.data?.accessToken
    client.region = LoggedInfo?.region || 'eu'
    client.setUrl(LoggedInfo?.region || 'eu')
    // Check if the token has expired, and refresh the token if it has expired
    if (
      LoggedInfo.data?.atExpiredTime < Date.now() &&
      LoggedInfo.data?.rtExpiredTime > Date.now()
    ) {
      console.log('Token expired, refreshing token')
      const refreshStatus = await client.user.refreshToken({
        rt: LoggedInfo.data?.refreshToken,
      })
      console.log(refreshStatus)
      if (refreshStatus.error === 0) {
        // You can also use built-in storage
        // client.storage.set('token', {...})
        fs.writeFileSync(
          './token.json',
          JSON.stringify({
            status: 200,
            responseTime: 0,
            error: 0,
            msg: '',
            data: {
              accessToken: refreshStatus?.data?.at,
              atExpiredTime: Date.now() + 2592000000,
              refreshToken: refreshStatus?.data?.rt,
              rtExpiredTime: Date.now() + 5184000000,
            },
            region: client.region,
          })
        )
        LoggedInfo = JSON.parse(fs.readFileSync('./token.json', 'utf-8'))
      }
    }
  
    if (LoggedInfo.data?.rtExpiredTime < Date.now()) {
      console.log('Failed to refresh token, need to log in again to obtain token')
      return
    }
  
    // Get device list
    try {
  
     const id="10015aa87c";
     await client.device.setThingStatus({
      type: 1,
      id: id,
      params: {
        switches: [
          { switch: 'off', outlet: 0 },
          { switch: 'off', outlet: 1 },
          { switch: 'off', outlet: 2 },
          { switch: 'off', outlet: 3 },
        ],
      },
    })
   res.redirect("/status")
    } catch (e) {
      console.log(e)
    }

  
  })

app.get('/redirectUrl', async (req,res) => {
    const { code, region } = req.query
    console.log(code, region)
    const response = await client.oauth.getToken({
      region,
      redirectUrl,
      code,
    })
  
    // You can write your own business here
    response['region'] = region
    fs.writeFileSync('./token.json', JSON.stringify(response))
  res.send(response)
  })
  
app.listen(PORT,()=>{
    console.log(`Example app listening on port ${PORT}`)
})