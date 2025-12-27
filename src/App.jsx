import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import Dashboard from './components/Dashboard'
import SetupWizard from './components/SetupWizard'
import { initializeTheme } from './data/themeStore'
import { initializeConfig } from './data/configStore'
import pb from './lib/pocketbase'

function App() {
    const [checkingSetup, setCheckingSetup] = useState(true)
    const [needsSetup, setNeedsSetup] = useState(false)

    // Check if first-time setup is needed
    useEffect(() => {
        async function checkSetup() {
            try {
                // Try to get business config
                const config = await pb.collection('config').getFirstListItem('key="business"')
                if (config?.value?.setupComplete) {
                    setNeedsSetup(false)
                } else {
                    setNeedsSetup(true)
                }
            } catch (err) {
                // No business config found = needs setup
                console.log('No setup found, showing wizard')
                setNeedsSetup(true)
            } finally {
                setCheckingSetup(false)
            }
        }

        initializeTheme()
        checkSetup()
    }, [])

    // Show loading while checking
    if (checkingSetup) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Cargando...</p>
                </div>
            </div>
        )
    }

    // Show setup wizard if needed
    if (needsSetup) {
        return (
            <SetupWizard
                onComplete={() => {
                    setNeedsSetup(false)
                    initializeConfig()
                }}
            />
        )
    }

    // Normal app
    return (
        <AuthProvider>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#1e293b',
                        color: '#fff',
                        borderRadius: '12px',
                    },
                }}
            />
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App
