import { useState } from 'react'
import { CalendarPlus, Trash2 } from 'lucide-react'
import CreateAppointment from '../components/appointments/CreateAppointment'
import DeleteAppointment from '../components/appointments/DeleteAppointment'

function AppointmentsPage() {
    const [activeTab, setActiveTab] = useState('create')

    const tabs = [
        { id: 'create', label: 'Agendar', icon: CalendarPlus },
        { id: 'delete', label: 'Eliminar', icon: Trash2 },
    ]

    return (
        <div className="max-w-3xl mx-auto">
            {/* Tabs */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 mb-4 md:mb-6 overflow-hidden">
                <div className="flex">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-3 md:py-4 px-2 md:px-6 text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/50'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 p-4 md:p-8 animate-fadeIn">
                {activeTab === 'create' && <CreateAppointment />}
                {activeTab === 'delete' && <DeleteAppointment />}
            </div>
        </div>
    )
}

export default AppointmentsPage
