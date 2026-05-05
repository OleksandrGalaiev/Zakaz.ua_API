const processEnv = process.env.TEST_ENV
const env = processEnv || 'my'


const config = {
    zakazURL: 'https://stores-api.zakaz.ua',
    zakazUser: "380932107253",
    zakazPassword: "3313804014"
}
// if(env === 'my'){
//     config.baseUrl = 'https://conduit-api.bondaracademy.com/api';
//     config.baseEmail = 'testTrading2';
//     config.basePassword = 'Test123!'
// }

export {config}