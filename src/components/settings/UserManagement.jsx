import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, User, Mail, Lock, Shield, Check, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

function UserManagement() {
    const { user: currentUser, hasPermission, canManageRole, getAllUsers, createUser, updateUser, deleteUser } = useAuth()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'operador' })

    useEffect(() => {
        loadUsers()
    }, [])

    async function loadUsers() {
        setLoading(true)
        try {
            const data = await getAllUsers()
            setUsers(data)
        } catch (error) {
            console.error('Error loading users:', error)
            toast.error('Error al cargar usuarios')
        } finally {
            setLoading(false)
        }
    }

    const roles = [
        { id: 'operador', name: 'Operador', description: 'Agendar y cancelar citas' },
        { id: 'gerente', name: 'Gerente', description: 'Gestión de servicios y operadores' },
        { id: 'superadmin', name: 'Super Admin', description: 'Acceso completo' },
    ]

    const availableRoles = roles.filter(r => canManageRole(r.id))

    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            toast.error('Todos los campos son obligatorios')
            return
        }

        if (!canManageRole(newUser.role)) {
            toast.error('No tienes permiso para crear este rol')
            return
        }

        if (newUser.password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres')
            return
        }

        try {
            await createUser(newUser.email, newUser.password, newUser.name, newUser.role)
            setNewUser({ name: '', email: '', password: '', role: 'operador' })
            setShowAddForm(false)
            toast.success('Usuario creado. El usuario recibirá un correo de confirmación.')
            await loadUsers()
        } catch (error) {
            console.error('Error creating user:', error)
            toast.error(error.message || 'Error al crear usuario')
        }
    }

    const handleDeleteUser = async (userId) => {
        const userToDelete = users.find(u => u.id === userId)

        if (userToDelete.id === currentUser?.id) {
            toast.error('No puedes eliminar tu propio usuario')
            return
        }

        if (!canManageRole(userToDelete.role)) {
            toast.error('No tienes permiso para eliminar este usuario')
            return
        }

        if (confirm(`¿Eliminar a ${userToDelete.name}?`)) {
            try {
                await deleteUser(userId)
                toast.success('Usuario eliminado')
                await loadUsers()
            } catch (error) {
                console.error('Error deleting user:', error)
                toast.error('Error al eliminar usuario')
            }
        }
    }

    const handleUpdateUser = async (userId, updates) => {
        try {
            await updateUser(userId, updates)
            setEditingId(null)
            toast.success('Usuario actualizado')
            await loadUsers()
        } catch (error) {
            console.error('Error updating user:', error)
            toast.error('Error al actualizar usuario')
        }
    }

    const canEditUser = (targetUser) => {
        if (targetUser.id === currentUser?.id) return true
        return canManageRole(targetUser.role)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Gestión de Usuarios</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{users.length} usuarios registrados</p>
                </div>
                <div className="flex gap-2">
                    {availableRoles.length > 0 && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="px-4 py-2 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Agregar
                        </button>
                    )}
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        Los usuarios nuevos podrán iniciar sesión inmediatamente con su contraseña.
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Se recomienda que cambien su contraseña en el primer inicio de sesión.
                    </p>
                </div>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-4 border border-primary-200 dark:border-primary-800">
                    <h3 className="font-medium text-primary-800 dark:text-primary-300 mb-3">Nuevo Usuario</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                        <input
                            type="text"
                            placeholder="Nombre completo"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            className="px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            className="px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                        <input
                            type="password"
                            placeholder="Contraseña (mín. 6 caracteres)"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                        <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            className="px-3 py-2 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            {availableRoles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddUser}
                                className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center justify-center gap-1"
                            >
                                <Check className="w-4 h-4" /> Crear
                            </button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="px-3 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-white rounded-lg hover:bg-slate-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Users List */}
            <div className="space-y-2">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className={`bg-slate-50 dark:bg-slate-700 rounded-xl p-4 border ${user.id === currentUser?.id
                            ? 'border-primary-300 dark:border-primary-600'
                            : 'border-slate-200 dark:border-slate-600'
                            }`}
                    >
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Avatar & Name */}
                            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'superadmin' ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                                    user.role === 'gerente' ? 'bg-gradient-to-br from-primary-500 to-primary-600' :
                                        'bg-gradient-to-br from-slate-400 to-slate-500'
                                    }`}>
                                    {user.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    {editingId === user.id && canEditUser(user) ? (
                                        <input
                                            type="text"
                                            defaultValue={user.name}
                                            onBlur={(e) => handleUpdateUser(user.id, { name: e.target.value })}
                                            className="px-2 py-1 border border-primary-300 rounded text-sm dark:bg-slate-600 dark:text-white"
                                        />
                                    ) : (
                                        <p className="font-medium text-slate-800 dark:text-white">
                                            {user.name}
                                            {user.id === currentUser?.id && (
                                                <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">(Tú)</span>
                                            )}
                                        </p>
                                    )}
                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            {/* Role Badge */}
                            <div className="flex items-center gap-2">
                                <Shield className={`w-4 h-4 ${user.role === 'superadmin' ? 'text-amber-500' :
                                    user.role === 'gerente' ? 'text-primary-500' :
                                        'text-slate-400'
                                    }`} />
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'superadmin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' :
                                    user.role === 'gerente' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300' :
                                        'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
                                    }`}>
                                    {roles.find(r => r.id === user.role)?.name || user.role}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1">
                                {canEditUser(user) && user.id !== currentUser?.id && (
                                    <>
                                        <button
                                            onClick={() => setEditingId(editingId === user.id ? null : user.id)}
                                            className={`p-2 rounded-lg transition-colors ${editingId === user.id
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                                                }`}
                                        >
                                            {editingId === user.id ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="p-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {users.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                    No hay usuarios registrados.
                </div>
            )}
        </div>
    )
}

export default UserManagement
