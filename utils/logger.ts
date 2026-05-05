
export class APILogger {
    private recentLogs: any[] = []

    logReguest(method: string, url: string, headers: Record<string, string>, body?: any){
        let logEntry = {method, url, headers, body}
        this.recentLogs.push({type: 'Request details', data: logEntry})
    }
    
    logResponse(statusCode: number, responseBody: any[]){
        let logEntry = {statusCode, responseBody}
        this.recentLogs.push({type: 'Response details', data: logEntry})
    }

    getResentLogs(){
        let logs = this.recentLogs.map(log =>{
            return `===${log.type}===\n${JSON.stringify(log.data, null, 4)}`
        }).join('\n\n')
        return logs
    }
}