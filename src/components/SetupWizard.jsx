import { useState } from 'react'
import { Building2, User, Lock, Palette, ArrowRight, Check, Loader2 } from 'lucide-react'
import pb from '../lib/pocketbase'

const BUSINESS_TYPES = [
    { id: 'estetica', name: 'Estética', icon: '💆‍♀️', defaultServices: ['Limpieza Facial', 'Hidratación', 'Masaje'] },
    { id: 'peluqueria', name: 'Peluquería', icon: '💇‍♀️', defaultServices: ['Corte', 'Tinte', 'Peinado'] },
    { id: 'unas', name: 'Salón de Uñas', icon: '💅', defaultServices: ['Manicure', 'Pedicure', 'Gelish'] },
    { id: 'lashes', name: 'Lashista', icon: '👁️', defaultServices: ['Extensiones', 'Lifting', 'Tinte de pestañas'] },
    { id: 'spa', name: 'Spa', icon: '🧖‍♀️', defaultServices: ['Masaje Relajante', 'Facial', 'Sauna'] },
    { id: 'otro', name: 'Otro', icon: '✨', defaultServices: [] },
]

function SetupWizard({ onComplete }) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        // Step 1: Business Info
        businessName: '',
        businessType: 'estetica',
        // Step 2: Admin User
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        adminPasswordConfirm: '',
        // Step 3: Theme
        primaryColor: 'teal',
    })

    const colors = [
        { id: 'teal', name: 'Verde Azulado', class: 'bg-teal-500' },
        { id: 'pink', name: 'Rosa', class: 'bg-pink-500' },
        { id: 'purple', name: 'Morado', class: 'bg-purple-500' },
        { id: 'blue', name: 'Azul', class: 'bg-blue-500' },
        { id: 'orange', name: 'Naranja', class: 'bg-orange-500' },
        { id: 'red', name: 'Rojo', class: 'bg-red-500' },
    ]

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const validateStep1 = () => {
        if (!formData.businessName.trim()) {
            setError('Ingresa el nombre de tu negocio')
            return false
        }
        return true
    }

    const validateStep2 = () => {
        if (!formData.adminName.trim()) {
            setError('Ingresa tu nombre')
            return false
        }
        if (!formData.adminEmail.trim() || !formData.adminEmail.includes('@')) {
            setError('Ingresa un email válido')
            return false
        }
        if (formData.adminPassword.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres')
            return false
        }
        if (formData.adminPassword !== formData.adminPasswordConfirm) {
            setError('Las contraseñas no coinciden')
            return false
        }
        return true
    }

    const nextStep = () => {
        if (step === 1 && validateStep1()) setStep(2)
        else if (step === 2 && validateStep2()) setStep(3)
    }

    const prevStep = () => {
        if (step > 1) setStep(step - 1)
    }

    const completeSetup = async () => {
        setLoading(true)
        setError('')

        try {
            // 1. Create admin user
            console.log('Creating admin user...')
            const user = await pb.collection('users').create({
                email: formData.adminEmail,
                password: formData.adminPassword,
                passwordConfirm: formData.adminPassword,
                name: formData.adminName,
                role: 'superadmin',
            })

            // 2. Login as admin
            console.log('Logging in...')
            await pb.collection('users').authWithPassword(formData.adminEmail, formData.adminPassword)

            // 3. Save business config
            console.log('Saving business config...')
            const selectedType = BUSINESS_TYPES.find(t => t.id === formData.businessType)

            await pb.collection('config').create({
                key: 'business',
                value: {
                    name: formData.businessName,
                    type: formData.businessType,
                    typeName: selectedType?.name || 'Negocio',
                    primaryColor: formData.primaryColor,
                    setupComplete: true,
                },
            })

            // 4. Create default services based on business type
            const defaultServices = selectedType?.defaultServices.map((name, i) => ({
                id: i + 1,
                nombre: name,
                precio: 25000,
                duracion: 60,
                categoria: 'General',
                staff: [formData.adminName],
            })) || []

            await pb.collection('config').create({
                key: 'services',
                value: defaultServices,
            })

            // 5. Create default staff
            await pb.collection('config').create({
                key: 'staff',
                value: [formData.adminName],
            })

            // 6. Create default currency
            await pb.collection('config').create({
                key: 'currency',
                value: 'ARS',
            })

            // 7. Create empty webhooks
            await pb.collection('config').create({
                key: 'webhooks',
                value: { dashboard: '', calendar: '', delete: '' },
            })

            console.log('Setup complete!')
            onComplete()
        } catch (err) {
            console.error('Setup error:', err)
            if (err.data?.data?.email) {
                setError('Este email ya está registrado')
            } else {
                setError(err.message || 'Error al completar la configuración')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Configuración Inicial</h1>
                    <p className="text-slate-400">Configura tu sistema de administración</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${s < step ? 'bg-teal-500 text-white' :
                                    s === step ? 'bg-teal-500 text-white ring-4 ring-teal-500/30' :
                                        'bg-slate-700 text-slate-400'
                                }`}>
                                {s < step ? <Check className="w-4 h-4" /> : s}
                            </div>
                            {s < 3 && <div className={`w-12 h-1 mx-1 rounded ${s < step ? 'bg-teal-500' : 'bg-slate-700'}`} />}
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 shadow-xl">
                    {/* Step 1: Business Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-1">Tu Negocio</h2>
                                <p className="text-slate-400 text-sm">¿Cómo se llama y qué tipo de negocio es?</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Nombre del Negocio
                                </label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    placeholder="Ej: Estética Integral Isabel Grimoldi"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Tipo de Negocio
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {BUSINESS_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, businessType: type.id })}
                                            className={`p-3 rounded-xl border-2 transition-all ${formData.businessType === type.id
                                                    ? 'border-teal-500 bg-teal-500/20'
                                                    : 'border-slate-600 hover:border-slate-500'
                                                }`}
                                        >
                                            <div className="text-2xl mb-1">{type.icon}</div>
                                            <div className="text-xs text-slate-300">{type.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Admin User */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-1">Administrador</h2>
                                <p className="text-slate-400 text-sm">Crea tu cuenta de administrador</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Tu Nombre
                                </label>
                                <input
                                    type="text"
                                    name="adminName"
                                    value={formData.adminName}
                                    onChange={handleChange}
                                    placeholder="Nombre completo"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="adminEmail"
                                    value={formData.adminEmail}
                                    onChange={handleChange}
                                    placeholder="tu@email.com"
                                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        <Lock className="w-4 h-4 inline mr-2" />
                                        Contraseña
                                    </label>
                                    <input
                                        type="password"
                                        name="adminPassword"
                                        value={formData.adminPassword}
                                        onChange={handleChange}
                                        placeholder="Mínimo 8 caracteres"
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Confirmar
                                    </label>
                                    <input
                                        type="password"
                                        name="adminPasswordConfirm"
                                        value={formData.adminPasswordConfirm}
                                        onChange={handleChange}
                                        placeholder="Repetir contraseña"
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Theme */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-1">Personalización</h2>
                                <p className="text-slate-400 text-sm">Elige el color principal de tu sistema</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-3">
                                    <Palette className="w-4 h-4 inline mr-2" />
                                    Color Principal
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {colors.map((color) => (
                                        <button
                                            key={color.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, primaryColor: color.id })}
                                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${formData.primaryColor === color.id
                                                    ? 'border-white bg-white/10'
                                                    : 'border-slate-600 hover:border-slate-500'
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full ${color.class}`} />
                                            <span className="text-sm text-slate-300">{color.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-slate-700/50 rounded-xl p-4 mt-6">
                                <h3 className="text-sm font-medium text-slate-300 mb-3">Resumen</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Negocio:</span>
                                        <span className="text-white">{formData.businessName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Tipo:</span>
                                        <span className="text-white">{BUSINESS_TYPES.find(t => t.id === formData.businessType)?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Admin:</span>
                                        <span className="text-white">{formData.adminEmail}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-6">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Atrás
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl transition-colors"
                            >
                                Siguiente
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={completeSetup}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-600 text-white font-medium rounded-xl transition-colors"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Configurando...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Completar Configuración
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-6">
                    Sistema de Administración v1.0
                </p>
            </div>
        </div>
    )
}

export default SetupWizard
