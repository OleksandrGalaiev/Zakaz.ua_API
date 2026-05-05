import { test } from '../utils/fixtures'

test.describe('Zakaz.ua Api tests', () => {
    test('API. Check User Delivery', { tag: '@api' }, async ({ api, config }) => {
        const responseData = await api
            .url(config.zakazURL)
            .path('/user/delivery')
            .GET_Request(200)
        console.log(responseData)
    })
})
