import { openDB, DBSchema } from 'idb'
import { shikharApi } from './api'

interface OfflineTransaction {
  id: string
  timestamp: string
  transactionType: string
  payload: any
  syncStatus: 'PENDING' | 'SYNCED' | 'CONFLICT'
  serverMessage?: string
}

interface ShikharDB extends DBSchema {
  transactions: {
    key: string
    value: OfflineTransaction
  }
}

const DB_NAME = 'shikhar_tactical_ledger'
const DB_VERSION = 1

export async function initLedgerDB() {
  return openDB<ShikharDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id' })
      }
    },
  })
}

export async function recordOfflineTransaction(
  transactionType: string,
  payload: any
): Promise<OfflineTransaction> {
  const db = await initLedgerDB()
  const txRecord: OfflineTransaction = {
    id: `TX-OFFLINE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    transactionType,
    payload,
    syncStatus: 'PENDING',
  }
  await db.put('transactions', txRecord)
  return txRecord
}

export async function getOfflineTransactions(): Promise<OfflineTransaction[]> {
  const db = await initLedgerDB()
  return db.getAll('transactions')
}

export async function syncOfflineLedger(): Promise<{ synced: number; conflicts: number }> {
  const db = await initLedgerDB()
  const allTxs = await db.getAll('transactions')
  const pending = allTxs.filter((t) => t.syncStatus === 'PENDING')
  
  let syncedCount = 0
  let conflictCount = 0

  for (const item of pending) {
    try {
      const res = await shikharApi.syncOfflineEvent({
        client_transaction_id: item.id,
        transaction_type: item.transactionType,
        payload_json: item.payload,
        client_timestamp: item.timestamp,
      })

      if (res.sync_status === 'CONFLICT_FLAGGED') {
        item.syncStatus = 'CONFLICT'
        item.serverMessage = res.conflict_resolution || 'Conflict detected by tactical rules'
        conflictCount++
      } else {
        item.syncStatus = 'SYNCED'
        syncedCount++
      }
      await db.put('transactions', item)
    } catch (e: any) {
      console.warn('Sync failed for transaction', item.id, e.message)
    }
  }

  return { synced: syncedCount, conflicts: conflictCount }
}
