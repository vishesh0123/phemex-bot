import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import BotConfig from '../../bot.config';
import axios from 'axios';
import file from '../../settings.json';
import CryptoJS from 'crypto-js';

function LogsTradesPage() {
    const [tradeData, setTradeData] = useState([]);

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

    return (
        <Box display='flex'
            flexDirection='column'
            ml='530px'
            mt='15px'
            width='720px'
            height='350px'
        >
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ 'bgcolor': 'black' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Time</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order ID</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Symbol</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Direction</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order Type</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Execution Price</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order Quantity</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Executed Quantity</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order Status</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>PNL</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tradeData.map((trade, index) => (
                            <TableRow key={index} sx={{ bgcolor: 'black' }}>
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
