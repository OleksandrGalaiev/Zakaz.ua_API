const processEnv = process.env.TEST_ENV
const env = processEnv || 'my'


const config = {
    zakazURL: 'https://stores-api.zakaz.ua',
    zakazUser: process.env.USER_PHONE,
    zakazPassword: process.env.USER_PASSWORD
}
// if(env === 'my'){
//     config.baseUrl = 'https://conduit-api.bondaracademy.com/api';
//     config.baseEmail = 'testTrading2';
//     config.basePassword = 'Test123!'
// }

export {config}