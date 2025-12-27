import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Loader2, AlertCircle, Scissors } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import pb from '../lib/pocketbase'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [businessName, setBusinessName] = useState({ line1: 'Administración', line2: '' })
    const { login } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        async function loadBusiness() {
            try {
                const config = await pb.collection('config').getFirstListItem('key="business"')
                if (config?.value?.name) {
                    const parts = config.value.name.split(' ')
                    if (parts.length > 2) {
                        const midpoint = Math.ceil(parts.length / 2)
                        setBusinessName({
                            line1: parts.slice(0, midpoint).join(' '),
                            line2: parts.slice(midpoint).join(' ')
                        })
                    } else if (parts.length === 2) {
                        setBusinessName({ line1: parts[0], line2: parts[1] })
                    } else {
                        setBusinessName({ line1: config.value.name, line2: config.value.typeName || '' })
                    }
                }
            } catch (err) {
                console.log('Could not load business name')
            }
        }
        loadBusiness()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log('=== LOGIN ATTEMPT ===')
        console.log('Email:', email)
        setLoading(true)
        setError('')

        try {
            console.log('Calling login...')
            const user = await login(email, password)
            console.log('Login successful:', user)
            console.log('Navigating to /')
            navigate('/')
        } catch (err) {
            console.error('Login failed:', err)
            setError(err.message || 'Error al iniciar sesión')
        } finally {
            console.log('Login attempt finished')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/30">
                        <Scissors className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">{businessName.line1}</h1>
                    {businessName.line2 && <p className="text-slate-400 mt-1">{businessName.line2}</p>}
                </div>

                {/* Login Card */}
                <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-black/20 p-8 border border-slate-700/50">
                    <h2 className="text-xl font-semibold text-white text-center mb-6">
                        Iniciar Sesión
                    </h2>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Correo Electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="correo@ejemplo.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Ingresando...
                                </>
                            ) : (
                                'Ingresar'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    © 2026 Estética Integral Isabel Grimoldi
                </p>
            </div>
        </div>
    )
}

export default LoginPage
