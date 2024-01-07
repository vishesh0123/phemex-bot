**Instructions To Install Phemex Bot**


1. Install NodeJS , I am using Node v20.9
2. Go to https://ngrok.com/  Signup and get you authtoken
3. Download ngrok for linux here https://ngrok.com/download
4. Clone this repo using git clone ``` git clone https://github.com/vishesh0123/phemex-bot ```
5. Go to projects folder ```phemex-bot```
6. As node is installed now , run ```npm install``` in projects folder
7. Lets setup ngrok , setup your authtoken by running ```ngrok config add-authtoken <token>```
8. run ```ngrok http 8080``` keep this terminal open
9. by running above command you will get localhost url (In my case its localhost:4000) open that localhost url and you can see one url there which is assigned to you
10. We need to use this url as tradingview alerts webhook
lets say url assigned to you is ```https://0aa6-110-227-5-180.ngrok-free.app``` just append ```/trade``` to it so for given url you will put 
```https://0aa6-110-227-5-180.ngrok-free.app/trade``` in tradingview alerts webhook
11. Now we are ready to start ui start ui by running ```npm run dev``` it will start backend server and frontend.
12. In frontend setting icon change your settings currently there is my apikey and secret included there so you can see orders in frontend I placed while testing , this is my account for testing only ..
13. Save your setting .. and may be close terminal where you ran ``` npm run dev``` and again run ```npm run dev``` so everythings works smoothly..

**Instructions For Bot Setting**
1. ```takeProfit``` ```stopLoss``` ```trailingsl``` ```limitprice``` ```limitdistance```  are in percentage 
2. ```dailyprofit``` ```dailylosss``` ```maxusdtpertrade``` are in USDT
3. Click on load pairs to load all pairs and select pair 

**Frontend**

1. On Top right you can see daily trades and whenever trade will happen , logs will be sent to discord
2. On bottom right you can see daily orders and their status , you can see tp/sl orders placed there 
3. On top left you can see ui in case you want to trade or place order manually 
4. On bottom left you can see todays pnl and trading will be halted if threshold reaches 
