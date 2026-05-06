import { expect } from '@playwright/test'
import { test } from '../utils/fixtures'
import { userDeliveryJSONSchema } from '../jsonSchema/userDelivery'
import z from 'zod'

test.describe('Zakaz.ua Api tests', () => {
    test('API. Check User Delivery', { tag: '@api' }, async ({ api, config }) => {
        const responseData = await api
            .url(config.zakazURL)
            .path('/user/delivery')
            .GET_Request(200)
        expect(responseData.delivery.address.plan.type).toEqual('apartment')
        expect(responseData.delivery.address.plan.region_id).toEqual('kiev')
        expect(responseData.delivery.address.plan.delivery_service_id).toEqual('zakaz')
        let zodJSONSchema = userDeliveryJSONSchema.safeParse(responseData)
        expect(zodJSONSchema.success, zodJSONSchema.success ? '' : z.prettifyError(zodJSONSchema.error)).toBeTruthy()
    })
})
