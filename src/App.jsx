import HomePage from './components/HomePage'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blue } from '@mui/material/colors';
import { Box } from '@mui/material';
import LogsTradesPage from './components/LogsTradesPage';


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
          <HomePage ml='15px' mt='15px' />
          <LogsTradesPage/>
        </Box>
      </ThemeProvider>
    </>
  )
}

export default App
