import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

function LogsOrdersPage() {
    const [tradeData, setTradeData] = useState([]);

    useEffect(() => {
        const socket = io('http://127.0.0.1:8080');

        const todayTrades = async () => {
            const data = await axios.get('http://127.0.0.1:8080/orders-today');
            setTradeData(data.data.data.rows);
            console.log("Today Orders", data);

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
            height='300px'
            position='fixed'
        >
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ 'bgcolor': 'black' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Time</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order ID</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Symbol</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Side</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order Type</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order Quantity</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Leaves Quantity</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order Status</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Take Profit</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stop Loss</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Time in Force</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tradeData.map((trade, index) => (
                            <TableRow key={index} sx={{ bgcolor: 'black' }}>
                                <TableCell sx={{ color: trade.side === 'Buy' ? 'green' : 'red', fontWeight: 'bold' }}>{(new Date(trade.transactTimeNs / 1e6)).toLocaleTimeString()}</TableCell>
                                <TableCell sx={{ color: trade.side === 'Buy' ? 'green' : 'red', fontWeight: 'bold' }}>{trade.orderId.slice(0, 6)}</TableCell>
                                <TableCell sx={{ color: trade.side === 'Buy' ? 'green' : 'red', fontWeight: 'bold' }}>{trade.symbol}</TableCell>
                                <TableCell sx={{ color: trade.side === 'Buy' ? 'green' : 'red', fontWeight: 'bold' }}>{trade.side}</TableCell>
                                <TableCell sx={{ color: trade.side === 'Buy' ? 'green' : 'red', fontWeight: 'bold' }}>{trade.ordType}</TableCell>
                                <TableCell sx={{ color: trade.side === 'Buy' ? 'green' : 'red', fontWeight: 'bold' }}>{trade.orderQtyRq}</TableCell>
                                <TableCell sx={{ color: trade.side === 'Buy' ? 'green' : 'red', fontWeight: 'bold' }}>{trade.leavesQtyRq}</TableCell>
                                <TableCell sx={{ color: trade.side === 'Buy' ? 'green' : 'red', fontWeight: 'bold' }}>{trade.ordStatus}</TableCell>
                                <TableCell sx={{ color: trade.side === 'Buy' ? 'green' : 'red', fontWeight: 'bold' }}>{trade.takeProfitRp}</TableCell>
                                <TableCell sx={{ color: trade.side === 'Buy' ? 'green' : 'red', fontWeight: 'bold' }}>{trade.stopLossRp}</TableCell>
                                <TableCell sx={{ color: trade.side === 'Buy' ? 'green' : 'red', fontWeight: 'bold' }}>{trade.timeInForce}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default LogsOrdersPage;
