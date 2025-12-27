import { createContext, useContext, useState, useEffect } from 'react'
import pb from '../lib/pocketbase'

// Role permissions
export const PERMISSIONS = {
    operador: {
        canViewDashboard: false,
        canCreateAppointments: true,
        canDeleteAppointments: true,
        canEditServices: false,
        canEditStaff: false,
        canEditCurrency: false,
        canEditWebhooks: false,
        canManageOperators: false,
        canManageGerentes: false,
        canManageAdmins: false,
        canChangeOwnPassword: true,
    },
    gerente: {
        canViewDashboard: true,
        canCreateAppointments: true,
        canDeleteAppointments: true,
        canEditServices: true,
        canEditStaff: false,
        canEditCurrency: false,
        canEditWebhooks: false,
        canManageOperators: true,
        canManageGerentes: true,
        canManageAdmins: false,
        canChangeOwnPassword: true,
        canChangeOperatorPassword: true,
        canChangeGerentePassword: true,
    },
    superadmin: {
        canViewDashboard: true,
        canCreateAppointments: true,
        canDeleteAppointments: true,
        canEditServices: true,
        canEditStaff: true,
        canEditCurrency: true,
        canEditWebhooks: true,
        canManageOperators: true,
        canManageGerentes: true,
        canManageAdmins: true,
        canChangeOwnPassword: true,
        canChangeOperatorPassword: true,
        canChangeGerentePassword: true,
        canChangeAdminPassword: true,
    },
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Check for existing session on mount
    useEffect(() => {
        checkUser()

        // Subscribe to auth state changes
        pb.authStore.onChange((token, model) => {
            console.log('Auth state changed:', model ? 'logged in' : 'logged out')
            if (model) {
                setUser({
                    id: model.id,
                    email: model.email,
                    name: model.name || model.email?.split('@')[0] || 'Usuario',
                    role: model.role || 'operador',
                })
            } else {
                setUser(null)
            }
        })
    }, [])

    async function checkUser() {
        try {
            console.log('Checking user session...')

            if (pb.authStore.isValid) {
                const model = pb.authStore.model
                console.log('Session found:', model?.email)

                // Refresh the auth data
                try {
                    await pb.collection('users').authRefresh()
                } catch (err) {
                    console.log('Could not refresh auth, using cached data')
                }

                setUser({
                    id: model.id,
                    email: model.email,
                    name: model.name || model.email?.split('@')[0] || 'Usuario',
                    role: model.role || 'operador',
                })
            } else {
                console.log('No valid session')
                setUser(null)
            }
        } catch (error) {
            console.error('Error checking user:', error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    // Login with email/password
    async function login(email, password) {
        setLoading(true)
        console.log('Starting login for:', email)

        try {
            const authData = await pb.collection('users').authWithPassword(email, password)

            console.log('Login successful:', authData.record.email)

            setUser({
                id: authData.record.id,
                email: authData.record.email,
                name: authData.record.name || authData.record.email?.split('@')[0] || 'Usuario',
                role: authData.record.role || 'operador',
            })

            return authData.record
        } catch (error) {
            console.error('Login error:', error)

            if (error.status === 400) {
                throw new Error('Credenciales incorrectas')
            }
            throw new Error(error.message || 'Error al conectar con el servidor')
        } finally {
            setLoading(false)
        }
    }

    // Logout
    async function logout() {
        console.log('Logging out...')
        pb.authStore.clear()
        setUser(null)
    }

    // Get role display name
    function getRoleName(role) {
        const names = {
            operador: 'Operador',
            gerente: 'Gerente',
            superadmin: 'Super Admin',
        }
        return names[role] || role
    }

    // Check if user has a specific permission
    function hasPermission(permission) {
        if (!user?.role) return false
        const rolePerms = PERMISSIONS[user.role]
        return rolePerms?.[permission] || false
    }

    // Check if current user can manage a specific role
    function canManageRole(targetRole) {
        if (!user?.role) return false
        const roleHierarchy = { operador: 1, gerente: 2, superadmin: 3 }
        return roleHierarchy[user.role] > roleHierarchy[targetRole]
    }

    // Get all users (admin function)
    async function getAllUsers() {
        try {
            const records = await pb.collection('users').getFullList({
                sort: 'created',
            })

            return records.map(record => ({
                id: record.id,
                email: record.email,
                name: record.name || record.email?.split('@')[0] || 'Usuario',
                role: record.role || 'operador',
            }))
        } catch (error) {
            console.error('Error fetching users:', error)
            throw error
        }
    }

    // Create new user (admin function)
    async function createUser(email, password, name, role) {
        try {
            const record = await pb.collection('users').create({
                email,
                password,
                passwordConfirm: password,
                name,
                role,
            })

            return {
                id: record.id,
                email: record.email,
                name: record.name,
                role: record.role,
            }
        } catch (error) {
            console.error('Error creating user:', error)
            if (error.data?.data?.email) {
                throw new Error('Este email ya está registrado')
            }
            throw error
        }
    }

    // Update user profile
    async function updateUser(userId, updates) {
        try {
            await pb.collection('users').update(userId, updates)
            return true
        } catch (error) {
            console.error('Error updating user:', error)
            throw error
        }
    }

    // Delete user
    async function deleteUser(userId) {
        try {
            await pb.collection('users').delete(userId)
            return true
        } catch (error) {
            console.error('Error deleting user:', error)
            throw error
        }
    }

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        getRoleName,
        hasPermission,
        canManageRole,
        getAllUsers,
        createUser,
        updateUser,
        deleteUser,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
