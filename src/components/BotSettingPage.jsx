import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import React, { useState } from 'react';
import KeyInput from './KeyInput';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';
import PairsMenu from './PairsMenu'
import file from '../../settings.json';
import BotConfig from '../../bot.config';
import CryptoJS from 'crypto-js';

function BotSettingPage() {
    const [setting, saveSetting] = useState({});
    const [open, setOpen] = useState(false);
    const [orderType, setOrderType] = useState(Number(file.orderType));
    const [leverageMode, setLeverageMode] = useState(Number(file.marginMode))
    const [posMode, setPosMode] = useState(Number(file.posMode))
    const [pairs, setPairs] = useState({})
    const [selectedPair, setSelectedPair] = useState('')
    const [testnet, setTestnet] = useState(file.testnet);

    const setLeverage = async (merged) => {
        let apiEndPoint = BotConfig.proxy.public.rest + "/g-positions/leverage"
        const symbol = merged.pair
        let leverageRr = Number(merged.leverage)
        if (leverageMode === 1) {
            leverageRr = (leverageRr * -1)
        }
        let signature;
        const currentUnixEpochTime = Math.floor(Date.now() / 1000) + 60;
        if (posMode === 1) { //one way
            apiEndPoint = apiEndPoint + `?symbol=${symbol}&leverageRr=${leverageRr}`
            const sigData = '/g-positions/leverage' + `symbol=${symbol}&leverageRr=${leverageRr}` + currentUnixEpochTime
            console.log(sigData);
            signature = CryptoJS.HmacSHA256(sigData, merged.apiSecret).toString();


        } else {
            apiEndPoint = apiEndPoint + `?symbol=${symbol}&longLeverageRr=${leverageRr}&shortLeverageRr=${leverageRr}`
            const sigData = '/g-positions/leverage' + `symbol=${symbol}&longLeverageRr=${leverageRr}&shortLeverageRr=${leverageRr}` + currentUnixEpochTime
            console.log(sigData);
            signature = CryptoJS.HmacSHA256(sigData, merged.apiSecret).toString();
        }

        console.log(apiEndPoint);
        console.log(merged);
        console.log(signature);
        const data = await axios.put(apiEndPoint, null, {
            headers: {
                'x-phemex-access-token': file.apiKey,
                'x-phemex-request-expiry': currentUnixEpochTime,
                'x-phemex-request-signature': signature
            }
        })
        console.log(data);

    }

    const saveSettingInconfig = async () => {
        const merged = {
            ...file,
            ...setting,
            orderType: orderType,
            marginMode: leverageMode,
            posMode: posMode,
            pair: selectedPair === '' ? file.pair : pairs[selectedPair].symbol,
            testnet: testnet
        }
        try {
            const response = await axios.post('http://127.0.0.1:8080/save-config', merged);
            await setLeverage(merged)

            if (response.data.success) {
                console.log('Configuration saved successfully.');
            } else {
                console.error('Failed to save configuration:', response.data.message);
            }
            console.log(file);
        } catch (error) {
            console.error('Error saving configuration:', error.message);

        }
    }

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Box sx={{ marginLeft: 'auto', marginRight: '10px' }}>
                <IconButton onClick={handleClickOpen} color="inherit" aria-label="settings">
                    <SettingsIcon />
                </IconButton>
            </Box>
            <Dialog open={open} onClose={handleClose} >
                <DialogTitle sx={{ background: 'black', textAlign: 'center', color: 'white', fontWeight: 'bold' }}>BOT CONFIGURATION</DialogTitle>
                <DialogContent sx={{ background: 'black', padding: '20px' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '500px',
                            height: '1300px'
                        }}
                    >
                        <KeyInput text='apiKey' type='password' setting={setting} saveSetting={saveSetting} value={file.apiKey} />
                        <KeyInput text='apiSecret' type='password' setting={setting} saveSetting={saveSetting} value={file.apiSecret} />
                        <KeyInput text='takeProfit' type='text' setting={setting} saveSetting={saveSetting} value={file.takeProfit} />
                        <KeyInput text='stopLoss' type='text' setting={setting} saveSetting={saveSetting} value={file.stopLoss} />
                        <KeyInput text='trailingStopLoss' type='text' setting={setting} saveSetting={saveSetting} value={file.trailingStopLoss} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-evenly', mt: '20px', mb: '20px' }}>
                            <PairsMenu
                                testMode={false}
                                tradingType={4}
                                pairs={pairs}
                                setPairs={setPairs}
                                selectedPair={selectedPair}
                                setSelectedPair={setSelectedPair}
                            />
                        </Box>
                        <Typography sx={{ 'color': 'white', fontWeight: 'bold' }}>SELECTED PAIR : {file.pair}</Typography>

                        <FormControl sx={{
                            width: '400px',
                            mt: '10px',
                            ml: '20px',
                            pb: '10px',
                            color: 'white',
                            fontWeight: 'bold', // Default color
                            '& .MuiInputLabel-root': { // Label styles
                                color: 'white', // Label color
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'white', // Default border color
                                },
                                '&:hover fieldset': {
                                    borderColor: 'white', // Hover border color
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'white', // Focused border color
                                },
                                '& input': {
                                    color: 'white', // Input text color
                                },
                            },
                            '& .MuiSelect-select': {
                                color: 'white', // Select text color
                                fontWeight: 'bold'
                            },
                            '& .MuiSvgIcon-root': { // Dropdown icon color
                                color: 'white'
                            }
                        }}>
                            <InputLabel id='ordertype' sx={{ color: 'white !important', fontWeight: 'bold' }}>orderType</InputLabel>
                            <Select
                                labelId='ordertype'
                                label='Order Type'
                                sx={{
                                    '& .MuiSelect-icon': {
                                        color: 'white', // Dropdown icon color
                                    },
                                }}
                                value={orderType}
                                onChange={(event) => { setOrderType(Number(event.target.value)) }}
                            >
                                <MenuItem sx={{ 'fontWeight': 'bold' }} value={1} >MARKET</MenuItem>
                                <MenuItem sx={{ 'fontWeight': 'bold' }} value={2}>LIMIT</MenuItem>
                                <MenuItem sx={{ 'fontWeight': 'bold' }} value={3}>LIMIT DISTANCE</MenuItem>

                            </Select>
                        </FormControl>
                        <KeyInput text='limitPrice' type='text' setting={setting} saveSetting={saveSetting} value={file.limitPrice} />
                        <KeyInput text='limitDistance' type='text' setting={setting} saveSetting={saveSetting} value={file.limitDistance} />
                        <KeyInput text='dailyProfitThreshold' setting={setting} type='text' saveSetting={saveSetting} value={file.dailyProfitThreshold} />
                        <KeyInput text='dailyLossThreshold' setting={setting} type='text' saveSetting={saveSetting} value={file.dailyLossThreshold} />
                        <KeyInput text='leverage' type='text' setting={setting} saveSetting={saveSetting} value={file.leverage} />
                        <KeyInput text='maxUSDTperTrade' type='text' setting={setting} saveSetting={saveSetting} value={file.maxUSDTperTrade} />
                        <KeyInput text='canclelimitOrderTime' type='text' setting={setting} saveSetting={saveSetting} value={file.canclelimitOrderTime} />
                        <KeyInput text='discordWebhook' type='text' setting={setting} saveSetting={saveSetting} value={file.discordWebhook} />
                        <FormControl sx={{
                            width: '400px',
                            mt: '20px',
                            ml: '20px',
                            color: 'white', // Default color
                            '& .MuiInputLabel-root': { // Label styles
                                color: 'white', // Label color
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'white', // Default border color
                                },
                                '&:hover fieldset': {
                                    borderColor: 'white', // Hover border color
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'white', // Focused border color
                                },
                                '& input': {
                                    color: 'white', // Input text color
                                    fontWeight: 'bold'
                                },
                            },
                            '& .MuiSelect-select': {
                                color: 'white', // Select text color
                                fontWeight: 'bold'
                            },
                            '& .MuiSvgIcon-root': { // Dropdown icon color
                                color: 'white'
                            }
                        }}>
                            <InputLabel id='ordertype' sx={{ color: 'white !important', fontWeight: 'bold' }}>marginMode</InputLabel>
                            <Select
                                labelId='ordertype'
                                label='Order Type'
                                sx={{
                                    '& .MuiSelect-icon': {
                                        color: 'white', // Dropdown icon color
                                    },
                                }}
                                value={leverageMode}
                                onChange={(event) => { setLeverageMode(Number(event.target.value)) }}
                            >
                                <MenuItem sx={{ 'fontWeight': 'bold' }} value={1} >CROSS MARGIN MODE</MenuItem>
                                <MenuItem sx={{ 'fontWeight': 'bold' }} value={2}>ISOLATED MARGIN MODE</MenuItem>

                            </Select>
                        </FormControl>
                        <FormControl sx={{
                            width: '400px',
                            mt: '20px',
                            ml: '20px',
                            color: 'white', // Default color
                            '& .MuiInputLabel-root': { // Label styles
                                color: 'white', // Label color
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'white', // Default border color
                                },
                                '&:hover fieldset': {
                                    borderColor: 'white', // Hover border color
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'white', // Focused border color
                                },
                                '& input': {
                                    color: 'white', // Input text color
                                    fontWeight: 'bold'
                                },
                            },
                            '& .MuiSelect-select': {
                                color: 'white', // Select text color
                                fontWeight: 'bold'
                            },
                            '& .MuiSvgIcon-root': { // Dropdown icon color
                                color: 'white'
                            }
                        }}>
                            <InputLabel id='ordertype' sx={{ color: 'white !important', fontWeight: 'bold' }}>posMode</InputLabel>
                            <Select
                                labelId='ordertype'
                                label='Order Type'
                                sx={{
                                    '& .MuiSelect-icon': {
                                        color: 'white', // Dropdown icon color
                                    },
                                }}
                                value={posMode}
                                onChange={(event) => { setPosMode(Number(event.target.value)); }}
                            >
                                <MenuItem sx={{ 'fontWeight': 'bold' }} value={1} >ONE WAY MODE</MenuItem>
                                <MenuItem sx={{ 'fontWeight': 'bold' }} value={2}>HEDGED MODE</MenuItem>

                            </Select>
                        </FormControl>
                        <FormControl sx={{
                            width: '400px',
                            mt: '20px',
                            ml: '20px',
                            color: 'white', // Default color
                            '& .MuiInputLabel-root': { // Label styles
                                color: 'white', // Label color
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'white', // Default border color
                                },
                                '&:hover fieldset': {
                                    borderColor: 'white', // Hover border color
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'white', // Focused border color
                                },
                                '& input': {
                                    color: 'white', // Input text color
                                    fontWeight: 'bold'
                                },
                            },
                            '& .MuiSelect-select': {
                                color: 'white', // Select text color
                                fontWeight: 'bold'
                            },
                            '& .MuiSvgIcon-root': { // Dropdown icon color
                                color: 'white'
                            }
                        }}>
                            <InputLabel id='ordertype' sx={{ color: 'white !important', fontWeight: 'bold' }}>testnet/mainnet</InputLabel>
                            <Select
                                labelId='ordertype'
                                label='Order Type'
                                sx={{
                                    '& .MuiSelect-icon': {
                                        color: 'white', // Dropdown icon color
                                    },
                                }}
                                value={testnet === false ? 1 : 2}
                                onChange={(event) => {
                                    if (event.target.value === 1) {
                                        setTestnet(false);
                                    } else {
                                        setTestnet(true);
                                    }
                                }}
                            >
                                <MenuItem sx={{ 'fontWeight': 'bold' }} value={1} >MAINNET</MenuItem>
                                <MenuItem sx={{ 'fontWeight': 'bold' }} value={2}>TESTNET</MenuItem>

                            </Select>
                        </FormControl>

                        <Button
                            sx={{
                                marginTop: '20px',
                                color: 'white',
                                border: '1px solid white',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                width: '200px',
                                height: '50px'

                            }}
                            onClick={async () => { await saveSettingInconfig() }}
                        >
                            SAVE SETTING
                        </Button>

                    </Box>
                </DialogContent>
                <DialogActions sx={{ background: 'black', justifyContent: 'center' }}>
                    <Button onClick={handleClose} variant="outlined">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default BotSettingPage;
