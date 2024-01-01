import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select } from '@mui/material';
import React, { useState } from 'react';
import KeyInput from './KeyInput';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';

function BotSettingPage() {
    const [setting, saveSetting] = useState({});
    const [open, setOpen] = useState(false);
    const [orderType, setOrderType] = useState(1);
    const [leverageMode, setLeverageMode] = useState(1)

    const saveSettingInconfig = async () => {
        const merged = { ...setting }
        try {
            const response = await axios.post('http://127.0.0.1:8080/save-config', merged);
            if (response.data.success) {
                console.log('Configuration saved successfully.');
            } else {
                console.error('Failed to save configuration:', response.data.message);
            }
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
                            width: '400px',
                            height: '900px'
                        }}
                    >
                        <KeyInput text='Api Key' type='password' setting={setting} saveSetting={saveSetting} />
                        <KeyInput text='Api Secret' type='password' setting={setting} saveSetting={saveSetting} />
                        <KeyInput text='Take Profit(%)' type='text' setting={setting} saveSetting={saveSetting} />
                        <KeyInput text='Stop Loss(%)' type='text' setting={setting} saveSetting={saveSetting} />
                        <FormControl sx={{
                            width: '400px',
                            mt: '10px',
                            pb: '10px',
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
                                },
                            },
                            '& .MuiSelect-select': {
                                color: 'white', // Select text color
                            },
                            '& .MuiSvgIcon-root': { // Dropdown icon color
                                color: 'white'
                            }
                        }}>
                            <InputLabel id='ordertype' sx={{ color: 'white !important' }}>Order Type</InputLabel>
                            <Select
                                labelId='ordertype'
                                label='Order Type'
                                sx={{
                                    '& .MuiSelect-icon': {
                                        color: 'white', // Dropdown icon color
                                    },
                                }}
                                value={orderType}
                                onChange={(event) => { setOrderType(Number(event.target.value)); saveSetting({ ...setting, orderType: Number(event.target.value) }) }}
                            >
                                <MenuItem value={1} >MARKET</MenuItem>
                                <MenuItem value={2}>LIMIT</MenuItem>
                                <MenuItem value={3}>STOP</MenuItem>
                                <MenuItem value={4}>STOP LIMIT</MenuItem>
                                <MenuItem value={5}>MARKET IF TOUCHED</MenuItem>
                                <MenuItem value={6}>LIMIT IF TOUCHED</MenuItem>

                            </Select>
                        </FormControl>
                        <KeyInput text='Limit Price(%)' type='text' setting={setting} saveSetting={saveSetting} />
                        <KeyInput text='Trigger Price(%)' type='text' setting={setting} saveSetting={saveSetting} />
                        <KeyInput text='Daily Profit Threshold Limit(%)' setting={setting} type='text' saveSetting={saveSetting} />
                        <KeyInput text='Daily Loss Threshold Limit(%)' setting={setting} type='text' saveSetting={saveSetting} />
                        <KeyInput text='Default Leverage X' type='text' setting={setting} saveSetting={saveSetting} />
                        <KeyInput text='Max USDT Per Trade' type='text' setting={setting} saveSetting={saveSetting} />
                        <FormControl sx={{
                            width: '400px',
                            mt: '10px',
                            pb: '10px',
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
                                },
                            },
                            '& .MuiSelect-select': {
                                color: 'white', // Select text color
                            },
                            '& .MuiSvgIcon-root': { // Dropdown icon color
                                color: 'white'
                            }
                        }}>
                            <InputLabel id='ordertype' sx={{ color: 'white !important' }}>Leverage Mode</InputLabel>
                            <Select
                                labelId='ordertype'
                                label='Order Type'
                                sx={{
                                    '& .MuiSelect-icon': {
                                        color: 'white', // Dropdown icon color
                                    },
                                }}
                                value={leverageMode}
                                onChange={(event) => { setLeverageMode(Number(event.target.value)); saveSetting({ ...setting, leverageMode: Number(event.target.value) }) }}
                            >
                                <MenuItem value={1} >CROSS MARGIN MODE</MenuItem>
                                <MenuItem value={2}>ISOLATED MARGIN MODE</MenuItem>

                            </Select>
                        </FormControl>

                        <Button
                            sx={{
                                marginTop: '20px',
                                color: 'white',
                                border: '1px solid white',
                                fontSize: '0.8rem',
                            }}
                            onClick={() => { saveSettingInconfig() }}
                        >
                            SAVE SETTING
                        </Button>
                        <Button
                            sx={{
                                marginTop: '10px',
                                color: 'white',
                                border: '1px solid white',
                                fontSize: '0.8rem',
                            }}
                        >
                            RESET
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
