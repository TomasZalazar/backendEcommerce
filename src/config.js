/* import * as url from 'url' */
import path from 'path';
import dotenv from 'dotenv';


dotenv.config();

const config = {
    SERVER: 'MongoDB',
    APP_NAME: 'TOMAS_APP',
    PORT: 4000,
    DIRNAME: path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1')), // Win
    // UPLOAD_DIR: 'public/img'
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img`; },
    MONGODB_URI: process.env.MONGODB_URI,
    // MONGODB_URI2: process.env.MONGODB_URI2",
    MONGODB_ID_REGEX: new RegExp(process.env.MONGODB_ID_REGEX),
    SECRET: process.env.SECRET,
    
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL
};

export default config