import { expect } from "@playwright/test"
import { APIRequestContext } from "playwright"
import { APILogger } from "./logger"

export class RequestHandler{
    private apiDefaultUrl: string 
    private request: APIRequestContext
    private apiUrl: string | undefined
    private apiPath: string
    private apiParams: Record<string, string> = {}
    private apiBody: object = {}
    private apiHeaders: Record<string, string> = {}
    private logger: APILogger

    constructor(request: APIRequestContext, apiBeseUrl:string, logger:APILogger ){
        this.request = request
        this.apiDefaultUrl = apiBeseUrl
        this.logger = logger
    }

    url(url:string){
        this.apiUrl = url
        return this
    }
    
    path(path:string){
        this.apiPath = path
        return this
    }

    params(params: Record<string, string>){
        this.apiParams = params
        return this
    }

    body(body: object){
        this.apiBody = body
        return this
    }

    headers(headers: Record<string, string>){
        this.apiHeaders = headers
        return this
    }
    private getUrl(){        
        //let url = new URL(`${this.apiUrl ?? this.apiDefaultUrl}${this.apiPath}`)
        let url = new URL(`${this.apiUrl}${this.apiPath}`)
        for(let [key, value] of Object.entries(this.apiParams)){
            url.searchParams.append(key, value)
        }
        return url.toString()
    }

    async GET_Request(statusCode: number){
        let url = this.getUrl()
        this.logger.logReguest('GET', url, {'headers': this.apiHeaders})
        
        let response = await this.request.get(
            url, {headers: this.apiHeaders}
        )
        this.cleanUpFileds()

        let actualStatus = await response.status()
        let data =  await response.json()
        this.logger.logResponse(actualStatus, data)
        this.statusCodeValidator(actualStatus, statusCode, this.GET_Request)
        //expect(actualStatus).toEqual(statusCode)
        return await data
    }

    async POST_Request(statusCode: number){
        let url = this.getUrl()
        this.logger.logReguest('POST', url, {'headers': this.apiHeaders}, this.apiBody)
        //add checking response form
        const isForm = this.apiHeaders['content-type'] === 'application/x-www-form-urlencoded'
        //add sending via different form
        let response = await this.request.post(
            url, {
                headers: this.apiHeaders, 
                form: isForm ? this.apiBody : undefined,
                data: !isForm ? this.apiBody : undefined
            })
        this.cleanUpFileds()
        let actualStatus = await response.status()
        let data =  await response.json()
        
        this.logger.logResponse(actualStatus, data)
        this.statusCodeValidator(actualStatus, statusCode, this.POST_Request)
        return await data
    }

    async POST_Request_withSavingState(statusCode: number, stateStorage?:string){
        let url = this.getUrl()
        this.logger.logReguest('POST', url, {'headers': this.apiHeaders}, this.apiBody)
        let response = await this.request.post(
            url, {
                headers: this.apiHeaders, 
                data: this.apiBody
            })
        this.cleanUpFileds()
        let actualStatus = await response.status()
        let data =  await response.json()
        
        this.logger.logResponse(actualStatus, data)
        this.statusCodeValidator(actualStatus, statusCode, this.POST_Request)
        let state = null
        if(stateStorage){
            state = await this.request.storageState({path:stateStorage})
        }
        return await data
    }


    async PUT_Request(statusCode: number){
        let url = this.getUrl()
        this.logger.logReguest('PUT', url, {'headers': this.apiHeaders}, this.apiBody)
        let response = await this.request.put(
            url, {
                headers: this.apiHeaders, 
                data: this.apiBody
            })
        this.cleanUpFileds()
        let actualStatus = await response.status()
        let data =  await response.json()
        this.logger.logResponse(actualStatus, data)
        this.statusCodeValidator(actualStatus, statusCode, this.PUT_Request)
        //expect(actualStatus).toEqual(statusCode)
        return await data
    }

    async DELETE_Request(statusCode: number){
        let url = this.getUrl()
        this.logger.logReguest('POST', url, {'headers': this.apiHeaders})
        let response = await this.request.delete(
            url, {
                headers: this.apiHeaders, 
            })
        this.cleanUpFileds()
        let actualStatus = await response.status()
        this.statusCodeValidator(actualStatus, statusCode, this.DELETE_Request)
        //expect(actualStatus).toEqual(statusCode)
    }


    private statusCodeValidator(actualCode: number, expectedCode: number, calledFunction: Function){
        if(actualCode !== expectedCode){
            let logs = this.logger.getResentLogs()
            let error = new Error(`Expected status coes is ${expectedCode} but got ${actualCode}\n\n Actual API info: ${logs}`)
            Error.captureStackTrace(error, calledFunction)
            throw error;
            
        }
    }
    private cleanUpFileds() {
        this.apiBody = {}
        this.apiHeaders = {}
        this.apiParams = {}
        this.apiPath = ''
        this.apiUrl = undefined
    }
}