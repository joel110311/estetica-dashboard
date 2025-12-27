import { Loader2 } from 'lucide-react'

function LoadingSpinner({ size = 'default', text = 'Cargando...' }) {
    const sizeClasses = {
        small: 'w-4 h-4',
        default: 'w-8 h-8',
        large: 'w-12 h-12'
    }

    return (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="relative">
                <div className="absolute inset-0 bg-primary-400/20 rounded-full blur-xl animate-pulse" />
                <Loader2 className={`${sizeClasses[size]} text-primary-500 animate-spin relative`} />
            </div>
            {text && (
                <p className="text-sm text-slate-500 font-medium">{text}</p>
            )}
        </div>
    )
}

export default LoadingSpinner
