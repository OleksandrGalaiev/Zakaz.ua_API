import { test as setup } from '../utils/fixtures'

const authFile = '.auth/ZakazUa_StorageState.json'

setup('authenticate', async ({ api, config }) => {
    await api
        .url(config.zakazURL)
        .path('/user/login/')
        .body({
            login: config.zakazUser,
            password: config.zakazPassword,
        })
        .POST_Request_withSavingState(200, authFile)
})
