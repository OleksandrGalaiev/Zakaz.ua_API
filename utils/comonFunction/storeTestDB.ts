export type StoreTestDB = Record<string, { id: string, retail_chain: string }>

export function buildStoreTestDB(stores: Array<{ id: string, name: string, retail_chain: string }>): StoreTestDB {
    const db: StoreTestDB = {}
    for (const store of stores) {
        db[store.name] = { id: store.id, retail_chain: store.retail_chain }
    }
    return db
}
