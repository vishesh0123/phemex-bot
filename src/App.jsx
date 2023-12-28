import HomePage from './components/HomePage'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blue } from '@mui/material/colors';


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
        <HomePage ml='50px' mt='15px' />
      </ThemeProvider>
    </>
  )
}

export default App
