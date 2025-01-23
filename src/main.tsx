import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { Provider } from './components/ui/provider'
import { HomeChakra, NavbarChakra } from './components/Navbar-chakra.tsx'
export const system = createSystem(defaultConfig)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider >
   <App/>

    </Provider>
   
  </StrictMode>,
)
