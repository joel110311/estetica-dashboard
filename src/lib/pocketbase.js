// PocketBase client configuration
import PocketBase from 'pocketbase'

// Default URL - will be overwritten by environment variable or config
const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090'

export const pb = new PocketBase(POCKETBASE_URL)

// Enable auto-cancellation for duplicate requests
pb.autoCancellation(false)

// Log connection status
console.log('PocketBase client initialized:', POCKETBASE_URL)

export default pb
