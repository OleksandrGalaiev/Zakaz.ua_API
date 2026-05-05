import {test as base} from "@playwright/test"
import { RequestHandler } from "./reguestHandler"
import { APILogger } from "./logger"
import { config } from "../api-test.config";


export type TestOptions = {
    api: RequestHandler,
    config: typeof config
}

export const test = base.extend<TestOptions>({
    api: async({request}, use)=>{
        let logger = new APILogger
        let requestHandler = new RequestHandler(request, config.zakazURL, logger)
        await use(requestHandler)
    },
    config: async({}, use)=>{
        await use(config)
    },
})