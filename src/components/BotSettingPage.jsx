import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import React, { useState } from 'react';
import KeyInput from './KeyInput';
import axios from 'axios';
import file from '../../settings.json';
import BotConfig from '../../bot.config';
import CryptoJS from 'crypto-js';

function BotSettingPage() {
    const [setting, saveSetting] = useState({});
    const [open, setOpen] = useState(false);
    const [orderType, setOrderType] = useState(Number(file.orderType));
    const [leverageMode, setLeverageMode] = useState(Number(file.marginMode))
    const [posMode, setPosMode] = useState(Number(file.posMode))
    const [testnet, setTestnet] = useState(file.testnet);
    const [trailingSL, setTrailingSL] = useState(file.trailingsl)


    const saveSettingInconfig = async () => {
        const merged = {
            ...file,
            ...setting,
            orderType: orderType,
            marginMode: leverageMode,
            posMode: posMode,
            testnet: testnet,
            trailingsl: trailingSL
        }
        try {
            const response = await axios.post('http://127.0.0.1:8080/save-config', merged);
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
            {/* <Box sx={{ marginLeft: 'auto', marginRight: '10px' }}>
                <IconButton onClick={handleClickOpen} color="inherit" aria-label="settings">
                    <SettingsIcon />
                </IconButton>
            </Box> */}
            {/* <Dialog open={open} onClose={handleClose} >
                <DialogTitle sx={{ background: 'black', textAlign: 'center', color: 'black', fontWeight: 'bold' }}>BOT CONFIGURATION</DialogTitle>
                <DialogContent sx={{ background: 'black', padding: '20px' }}> */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: `${(window.innerWidth * (1 / 3)) - 20}px`,
                            height:`${window.innerHeight - 20}px`,
                            
                        }}
                        
                    >
                        <img src="src/icons/phemex.svg" alt="Description" width='200px' height='200px' />
                        <KeyInput text='apiKey' type='password' setting={setting} saveSetting={saveSetting} value={file.apiKey} />
                        <KeyInput text='apiSecret' type='password' setting={setting} saveSetting={saveSetting} value={file.apiSecret} />
                        <KeyInput text='takeProfit' type='text' setting={setting} saveSetting={saveSetting} value={file.takeProfit} />
                        <KeyInput text='stopLoss' type='text' setting={setting} saveSetting={saveSetting} value={file.stopLoss} />
                        <KeyInput text='trailingStopLoss' type='text' setting={setting} saveSetting={saveSetting} value={file.trailingStopLoss} />

                        <FormControl sx={{
                           width: `${(window.innerWidth * (1 / 3)) - 100}px`,
                            mt: '20px',
                            ml: '20px',
                            pb: '10px',
                            color: 'black',
                            fontWeight: 'bold',
                            '& .MuiInputLabel-root': {
                                color: 'black',
                                fontWeight: 'bold',
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'black',
                                    borderWidth:'2px'
                                },
                                '&:hover fieldset': {
                                    borderColor: 'black',
                                    borderWidth:'2px'
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'black',
                                    borderWidth:'2px'
                                },
                                '& input': {
                                    color: 'black',
                                    fontWeight: 'bold',
                                },
                            },
                            '& .MuiSelect-select': {
                                color: 'black',
                                fontWeight: 'bold'
                            },
                            '& .MuiSvgIcon-root': {
                                color: 'black',
                                fontWeight: 'bold'

                            }
                        }}>
                            <InputLabel id='ordertype' sx={{ color: 'black !important', fontWeight: 'bold' }}>orderType</InputLabel>
                            <Select
                                labelId='ordertype'
                                label='Order Type'
                                sx={{
                                    '& .MuiSelect-icon': {
                                        color: 'black',
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
                        <KeyInput text='limitDistance' type='text' setting={setting} saveSetting={saveSetting} value={file.limitDistance} />
                        <KeyInput text='dailyProfitThreshold' setting={setting} type='text' saveSetting={saveSetting} value={file.dailyProfitThreshold} />
                        <KeyInput text='dailyLossThreshold' setting={setting} type='text' saveSetting={saveSetting} value={file.dailyLossThreshold} />
                        <KeyInput text='leverage' type='text' setting={setting} saveSetting={saveSetting} value={file.leverage} />
                        <KeyInput text='maxUSDTperTrade' type='text' setting={setting} saveSetting={saveSetting} value={file.maxUSDTperTrade} />
                        <KeyInput text='canclelimitOrderTime' type='text' setting={setting} saveSetting={saveSetting} value={file.canclelimitOrderTime} />
                        <KeyInput text='discordWebhook' type='text' setting={setting} saveSetting={saveSetting} value={file.discordWebhook} />
                        <FormControl sx={{
                         width: `${(window.innerWidth * (1 / 3)) - 100}px`,
                            mt: '20px',
                            ml: '20px',
                            color: 'black',
                            '& .MuiInputLabel-root': { // Label styles
                                color: 'black', // Label color
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'black',
                                    borderWidth:'2px'
                                },
                                '&:hover fieldset': {
                                    borderColor: 'black', // Hover border color
                                    borderWidth:'2px'
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'black',
                                    borderWidth:'2px'
                                },
                                '& input': {
                                    color: 'black',
                                    fontWeight: 'bold'
                                },
                            },
                            '& .MuiSelect-select': {
                                color: 'black', // Select text color
                                fontWeight: 'bold'
                            },
                            '& .MuiSvgIcon-root': { // Dropdown icon color
                                color: 'black'
                            }
                        }}>
                            <InputLabel id='ordertype' sx={{ color: 'black !important', fontWeight: 'bold' }}>marginMode</InputLabel>
                            <Select
                                labelId='ordertype'
                                label='Order Type'
                                sx={{
                                    '& .MuiSelect-icon': {
                                        color: 'black', // Dropdown icon color
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
                           width: `${(window.innerWidth * (1 / 3)) - 100}px`,
                            mt: '20px',
                            ml: '20px',
                            color: 'black', // Default color
                            '& .MuiInputLabel-root': { // Label styles
                                color: 'black', // Label color
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'black', // Default border color
                                    borderWidth:'2px'
                                },
                                '&:hover fieldset': {
                                    borderColor: 'black', // Hover border color
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'black', // Focused border color
                                },
                                '& input': {
                                    color: 'black', // Input text color
                                    fontWeight: 'bold'
                                },
                            },
                            '& .MuiSelect-select': {
                                color: 'black', // Select text color
                                fontWeight: 'bold'
                            },
                            '& .MuiSvgIcon-root': { // Dropdown icon color
                                color: 'black'
                            }
                        }}>
                            <InputLabel id='ordertype' sx={{ color: 'black !important', fontWeight: 'bold' }}>posMode</InputLabel>
                            <Select
                                labelId='ordertype'
                                label='Order Type'
                                sx={{
                                    '& .MuiSelect-icon': {
                                        color: 'black', // Dropdown icon color
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
                            width: `${(window.innerWidth * (1 / 3)) - 100}px`,
                            mt: '20px',
                            ml: '20px',
                            color: 'black', // Default color
                            '& .MuiInputLabel-root': { // Label styles
                                color: 'black', // Label color
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'black', // Default border color
                                    borderWidth:'2px'
                                },
                                '&:hover fieldset': {
                                    borderColor: 'black', // Hover border color
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'black', // Focused border color
                                },
                                '& input': {
                                    color: 'black', // Input text color
                                    fontWeight: 'bold'
                                },
                            },
                            '& .MuiSelect-select': {
                                color: 'black', // Select text color
                                fontWeight: 'bold'
                            },
                            '& .MuiSvgIcon-root': { // Dropdown icon color
                                color: 'black'
                            }
                        }}>
                            <InputLabel id='ordertype' sx={{ color: 'black !important', fontWeight: 'bold' }}>testnet/mainnet</InputLabel>
                            <Select
                                labelId='ordertype'
                                label='Order Type'
                                sx={{
                                    '& .MuiSelect-icon': {
                                        color: 'black', // Dropdown icon color
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
                        <FormControl sx={{
                          width: `${(window.innerWidth * (1 / 3)) - 100}px`,
                            mt: '20px',
                            ml: '20px',
                            color: 'black', // Default color
                            '& .MuiInputLabel-root': { // Label styles
                                color: 'black', // Label color
                            },
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'black', // Default border color
                                    borderWidth:'2px'
                                },
                                '&:hover fieldset': {
                                    borderColor: 'black', // Hover border color
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'black', // Focused border color
                                },
                                '& input': {
                                    color: 'black', // Input text color
                                    fontWeight: 'bold'
                                },
                            },
                            '& .MuiSelect-select': {
                                color: 'black', // Select text color
                                fontWeight: 'bold'
                            },
                            '& .MuiSvgIcon-root': { // Dropdown icon color
                                color: 'black'
                            }
                        }}>
                            <InputLabel id='ordertype' sx={{ color: 'black !important', fontWeight: 'bold' }}>trailingSL</InputLabel>
                            <Select
                                labelId='ordertype'
                                label='Order Type'
                                sx={{
                                    '& .MuiSelect-icon': {
                                        color: 'black', // Dropdown icon color
                                    },
                                }}
                                value={trailingSL === true ? 1 : 2}
                                onChange={(event) => {
                                    if (event.target.value === 1) {
                                        setTrailingSL(true);
                                    } else {
                                        setTrailingSL(false);
                                    }
                                }}
                            >
                                <MenuItem sx={{ 'fontWeight': 'bold' }} value={1} >On</MenuItem>
                                <MenuItem sx={{ 'fontWeight': 'bold' }} value={2}>Off</MenuItem>

                            </Select>
                        </FormControl>

                        <Button
                            sx={{
                                marginTop: '20px',
                                color: 'black',
                                border: '2px solid black',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                width: `${(window.innerWidth * (1 / 3)) - 170}px`,
                                height: '50px',
                                

                            }}
                            onClick={async () => { await saveSettingInconfig() }}
                        >
                            SAVE SETTING
                        </Button>
                        <Button
                            sx={{
                                marginTop: '20px',
                                color: 'black',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                width: '200px',
                                height: '50px',
                                

                            }}
                        >
                            
                        </Button>
                       

                    </Box>
                    
                {/* </DialogContent>
                <DialogActions sx={{ background: 'black', justifyContent: 'center' }}>
                    <Button onClick={handleClose} variant="outlined">
                        Close
                    </Button>
                </DialogActions>
            </Dialog> */}
        </>
    );
}

export default BotSettingPage;
