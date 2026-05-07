import { expect } from '@playwright/test'
import { test } from '../utils/fixtures'
import z from 'zod'
import { userProfileJSONSchema } from '../jsonSchema/userProfile'

test.describe('Example: Zakaz.UA API test patterns', () => {
    test('GET /user/profile — business asserts + Zod schema validation', { tag: '@example' }, async ({ api, config }) => {
        const profile = await api
            .url(config.zakazURL)
            .path('/user/profile/')
            .GET_Request(200)

        expect(profile.login.phone).toEqual(process.env.USER_PHONE)
        expect(profile.emails[0].email).toEqual(process.env.USER_EMAIL)

        const parsed = userProfileJSONSchema.safeParse(profile)
        expect(
            parsed.success,
            parsed.success ? '' : z.prettifyError(parsed.error),
        ).toBeTruthy()
    })

    test('GET with query params and custom headers', { tag: '@example' }, async ({ api, config }) => {
        const response = await api
            .url(config.zakazURL)
            .path('/stores/')
            .params({ region_id: 'kiev' })
            .headers({ 'accept-language': 'ru' })
            .GET_Request(200)

        expect(Array.isArray(response) || typeof response === 'object').toBeTruthy()
    })

    test('Inline Zod schema for a smaller endpoint', { tag: '@example' }, async ({ api, config }) => {
        const phoneEntry = z.object({
            phone: z.string(),
            is_editable: z.boolean(),
        })
        const profileSlice = z.object({
            name: z.string(),
            phones: z.array(phoneEntry).min(1),
        })

        const profile = await api
            .url(config.zakazURL)
            .path('/user/profile/')
            .GET_Request(200)

        const parsed = profileSlice.safeParse(profile)
        expect(
            parsed.success,
            parsed.success ? '' : z.prettifyError(parsed.error),
        ).toBeTruthy()
    })
})
