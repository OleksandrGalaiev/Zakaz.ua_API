import { expect } from '@playwright/test'
import { test } from '../utils/fixtures'
import { storesJSONSchema } from '../jsonSchema/stores'
import { buildStoreTestDB } from '../utils/comonFunction/storeTestDB'
import expectedStores from '../testData/stores.json'
import z from 'zod'

test.describe('Store Discovery - Retail Chain Filtering', () => {
    test('A2.1 - Stores response contains id, name, retail_chain for every store', { tag: '@debug' }, async ({ api, config }) => {
        const storesResponse = await test.step('GET /stores/ with Kyiv coords and zakaz delivery service', async () => {
            return await api
                .url(config.zakazURL)
                .path('/stores/')
                .params({
                    'include_delivery': '1',
                    'coords': '50.46977,30.605808523043514',
                    'delivery_service_id': 'zakaz'
                })
                .GET_Request(200)
        })

        await test.step('Each store in response has correct id and retail_chain from expectedStores', async () => {
            expect(Array.isArray(storesResponse), 'Response should be an array').toBeTruthy()
            expect(storesResponse.length, 'Response should contain stores').toBeGreaterThan(0)

            for (const store of storesResponse) {
                const expected = expectedStores[store.name as keyof typeof expectedStores]
                expect(expected, `Store "${store.name}" is not present in expectedStores`).toBeDefined()
                expect(store.id, `Store "${store.name}" has wrong id`).toBe(expected.id)
                expect(store.retail_chain, `Store "${store.name}" has wrong retail_chain`).toBe(expected.retail_chain)
            }
        })

        await test.step('Response matches storesJSONSchema (zod)', async () => {
            const zodJSONSchema = storesJSONSchema.safeParse(storesResponse)
            expect(zodJSONSchema.success, zodJSONSchema.success ? '' : z.prettifyError(zodJSONSchema.error))
                .toBeTruthy()
        })
    })


})
