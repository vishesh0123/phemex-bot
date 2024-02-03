import HomePage from './components/HomePage'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blue } from '@mui/material/colors';
import { Box } from '@mui/material';
import LogsTradesPage from './components/LogsTradesPage';
import LogsOrdersPage from './components/LogsOrdersPage'


const theme = createTheme({
  palette: {
    primary: {
      light: blue[300],
      main: blue[500],
      dark: blue[700],
      darker: blue[900],
    },
    secondary: {
      main: '#FFFFFF'
    }
  },
});

function App() {

  return (
    <>
      <ThemeProvider theme={theme}>
        <Box display='flex' width='100%' flexDirection='row'>
          <HomePage  mt='15px' />
          <Box>
            <LogsTradesPage />
            {/* <LogsOrdersPage /> */}
          </Box>
        </Box>
      </ThemeProvider>
    </>
  )
}

export default App
