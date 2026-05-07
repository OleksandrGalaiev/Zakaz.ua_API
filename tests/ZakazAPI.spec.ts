import { expect } from '@playwright/test'
import { test } from '../utils/fixtures'
import { userDeliveryJSONSchema } from '../jsonSchema/userDelivery'
import z from 'zod'
import { userProfileJSONSchema } from '../jsonSchema/userProfile'
import { storesJSONSchema } from '../jsonSchema/stores'

test.describe('Zakaz.ua Api tests', () => {
    test('API. Check User Delivery', { tag: '@api' }, async ({ api, config }) => {
        let responseData = await api
            .url(config.zakazURL)
            .path('/user/delivery')
            .GET_Request(200)
        expect(responseData.delivery.address.plan.type).toEqual('apartment')
        expect(responseData.delivery.address.plan.region_id).toEqual('kiev')
        expect(responseData.delivery.address.plan.delivery_service_id).toEqual('zakaz')
        let zodJSONSchema = userDeliveryJSONSchema.safeParse(responseData)
        expect(zodJSONSchema.success, zodJSONSchema.success ? '' : z.prettifyError(zodJSONSchema.error)).toBeTruthy()
    })

    test(`API. Check user profile response`, {tag:'@api'}, async({api, config})=>{
        let profileResponse = await api
        .url(config.zakazURL)
        .path('/user/profile/')
        .GET_Request(200)

        expect(profileResponse.login.phone).toEqual(process.env.USER_PHONE)
        expect(profileResponse.phones[0].phone).toEqual(process.env.USER_PHONE)
        expect(profileResponse.emails[0].email).toEqual(process.env.USER_EMAIL)
        expect(profileResponse.name).toEqual('Александр')
        let zodJSONSchema = userProfileJSONSchema.safeParse(profileResponse)
        expect(zodJSONSchema.success, zodJSONSchema.success ? '':z.prettifyError(zodJSONSchema.error)).toBeTruthy()
    })

    test(`API. Check Stores api response`, {'tag':'@debug'}, async({api, config})=>{
        const retailChainList = [
            'alcohub','auchan','biotus',
            'cosmos','ekomarket','epicentr',
            'masterzoo','megamarket','metro',
            'novus','ultramarket','winetime','zaraz'
        ]
        let storesResponse = await api
        .url(config.zakazURL)
        .path('/stores/')
        .params({
            'include_delivery':'1',
            'coords':'50.46977,30.605808523043514',
            'delivery_service_id':'zakaz'
        }).GET_Request(200)
        for(let store of storesResponse){
            expect(retailChainList).toContain(store.retail_chain)
        }
        let zodJSONSchema = storesJSONSchema.safeParse(storesResponse)
        expect(zodJSONSchema.success, zodJSONSchema.success ? '' : z.prettifyError(zodJSONSchema.error)).toBeTruthy()
    })

})
