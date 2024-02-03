import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper , Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import BotConfig from '../../bot.config';
import axios from 'axios';
import file from '../../settings.json';
import CryptoJS from 'crypto-js';

function LogsTradesPage() {
    const [tradeData, setTradeData] = useState([]);
    const [pnl, setpnl] = useState(0);
    const [balance, setBalance] = useState('');
    const [usedBalance, setUsedBalance] = useState('');
    const [server, setServer] = useState(true);

    const getPNL = async () => {
        try {
            const data = await axios.get('http://127.0.0.1:8080/pnl-today');
            setpnl(data.data.pnl);
        } catch {
            setServer(false);
        }

    }

    const getUSDTBalance = async () => {
        let apiEndPoint = file.testnet ?
            BotConfig.proxy.testnet.rest + "/g-accounts/positions?currency=USDT" :
            BotConfig.proxy.public.rest + "/g-accounts/positions?currency=USDT";
        const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
        const apiKey = file.apiKey;
        const apiSecret = file.apiSecret;

        const sigData = "/g-accounts/positionscurrency=USDT" + currentUnixEpochTime;
        const signature = CryptoJS.HmacSHA256(sigData, apiSecret).toString();

        const data = await axios.get(apiEndPoint, {
            headers: {
                'x-phemex-access-token': apiKey,
                'x-phemex-request-expiry': currentUnixEpochTime,
                'x-phemex-request-signature': signature
            }
        })
        setBalance(data.data.data.account.accountBalanceRv);
        setUsedBalance(data.data.data.account.totalUsedBalanceRv);
    }

    useEffect(() => {
        const socket = io('http://127.0.0.1:8080');

        const todayTrades = async () => {
            const data = await axios.get('http://127.0.0.1:8080/trades-today');
            setTradeData(data.data);
            console.log("Today Trades", data);

        }

        todayTrades();

        socket.on('NewSignal', async (args) => {
            todayTrades();

        });
    }, []);

    useEffect(() => {
        getPNL();
        getUSDTBalance();
        const intervalId = setInterval(getPNL, 10000);
        return () => clearInterval(intervalId);

    }, []);

    return (
        <Box display='flex'
            flexDirection='column'
          
            mt='15px'
            sx={{
                ml:`${(window.innerWidth * (1 / 3) + 30)}px`,
                width: `${(window.innerWidth * (2 / 3) - 40)}px`,
                height: `${(window.innerHeight -30)}px`,
            }}
        >
            <Box ml='20px' display='flex' flexDirection='row' gap='20px'  sx={{ height: '50px' }}>
                    <Typography
                        sx=
                        {{
                            'fontSize': '20px',
                            'color': parseFloat(pnl) > 0 ? 'green' : 'red',
                            fontWeight: 'bold'
                        }}
                    >PNL : {pnl.toString().slice(0, 6) + ` USDT`}</Typography>
                    <Typography sx={{ 'fontWeight': 'bold' , color:'black' , 'fontSize': '20px', }}>USDT : {balance} &nbsp; USED : {usedBalance}</Typography>
                    <Typography sx={{ 'fontWeight': 'bold', color: server ? 'green' : 'red', 'fontSize': '20px', }}>SERVER: {server ? 'LIVE' : 'OOPS'}  &nbsp;</Typography>


            </Box>
            <TableContainer sx={{marginTop:'30px'}} component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ 'bgcolor': '#F3F7F9' }}>
                            <TableCell sx={{ color: 'black', fontWeight: 'bold', fontSize:'18px' }}>TIME</TableCell>
                            <TableCell sx={{ color: 'black', fontWeight: 'bold' , fontSize:'18px'  }}>ORDER ID</TableCell>
                            <TableCell sx={{ color: 'black', fontWeight: 'bold' , fontSize:'18px' }}>SYMBOL</TableCell>
                            <TableCell sx={{ color: 'black', fontWeight: 'bold', fontSize:'18px' }}>DIRECTION</TableCell>
                            <TableCell sx={{ color: 'black', fontWeight: 'bold',fontSize:'18px'  }}>ORDER TYPE</TableCell>
                            <TableCell sx={{ color: 'black', fontWeight: 'bold', fontSize:'18px' }}>EXEC PRICE</TableCell>
                            <TableCell sx={{ color: 'black', fontWeight: 'bold', fontSize:'18px' }}>ORDER</TableCell>
                            <TableCell sx={{ color: 'black', fontWeight: 'bold', fontSize:'18px' }}>EXEC QTY</TableCell>
                            <TableCell sx={{ color: 'black', fontWeight: 'bold', fontSize:'18px' }}>STATUS</TableCell>
                            <TableCell sx={{ color: 'black', fontWeight: 'bold', fontSize:'18px' }}>PNL</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tradeData.map((trade, index) => (
                            <TableRow key={index} sx={{ bgcolor: '#F3F7F9' }}>
                                <TableCell sx={{ color: ((trade.side === 'Buy' && trade.posSide === 'Long') || (trade.side === 'Sell' && trade.posSide === 'Short')) ? 'green' : 'red', fontWeight: 'bold' }}>{(new Date(trade.transactTimeNs / 1e6)).toLocaleTimeString()}</TableCell>
                                <TableCell sx={{ color: ((trade.side === 'Buy' && trade.posSide === 'Long') || (trade.side === 'Sell' && trade.posSide === 'Short')) ? 'green' : 'red', fontWeight: 'bold' }}>{trade.orderID.slice(0, 6) + `..`}</TableCell>
                                <TableCell sx={{ color: ((trade.side === 'Buy' && trade.posSide === 'Long') || (trade.side === 'Sell' && trade.posSide === 'Short')) ? 'green' : 'red', fontWeight: 'bold' }}>{trade.symbol}</TableCell>
                                <TableCell sx={{ color: ((trade.side === 'Buy' && trade.posSide === 'Long') || (trade.side === 'Sell' && trade.posSide === 'Short')) ? 'green' : 'red', fontWeight: 'bold' }}>{`${((trade.side === 'Buy' && trade.posSide === 'Long') || (trade.side === 'Sell' && trade.posSide === 'Short')) ? 'Open' : 'Close'} ${trade.posSide}`}</TableCell>
                                <TableCell sx={{ color: ((trade.side === 'Buy' && trade.posSide === 'Long') || (trade.side === 'Sell' && trade.posSide === 'Short')) ? 'green' : 'red', fontWeight: 'bold' }}>{trade.ordType}</TableCell>
                                <TableCell sx={{ color: ((trade.side === 'Buy' && trade.posSide === 'Long') || (trade.side === 'Sell' && trade.posSide === 'Short')) ? 'green' : 'red', fontWeight: 'bold' }}>{trade.execPriceRp}</TableCell>
                                <TableCell sx={{ color: ((trade.side === 'Buy' && trade.posSide === 'Long') || (trade.side === 'Sell' && trade.posSide === 'Short')) ? 'green' : 'red', fontWeight: 'bold' }}>{trade.orderQtyRq}</TableCell>
                                <TableCell sx={{ color: ((trade.side === 'Buy' && trade.posSide === 'Long') || (trade.side === 'Sell' && trade.posSide === 'Short')) ? 'green' : 'red', fontWeight: 'bold' }}>{trade.execQtyRq}</TableCell>
                                <TableCell sx={{ color: ((trade.side === 'Buy' && trade.posSide === 'Long') || (trade.side === 'Sell' && trade.posSide === 'Short')) ? 'green' : 'red', fontWeight: 'bold' }}>{trade.execStatus}</TableCell>
                                <TableCell sx={{ color: ((trade.side === 'Buy' && trade.posSide === 'Long') || (trade.side === 'Sell' && trade.posSide === 'Short')) ? 'green' : 'red', fontWeight: 'bold' }} >{trade.closedPnlRv}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default LogsTradesPage;
