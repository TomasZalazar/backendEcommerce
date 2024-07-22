/* import * as url from 'url' */
import path from 'path';
import dotenv from 'dotenv';
import { Command } from 'commander';


const commandLine = new Command();
commandLine
    .option('--mode <mode>')
    .option('--port <port>')
    .option('--setup <number>')
commandLine.parse();
const clOptions = commandLine.opts();

dotenv.config({ path: clOptions.mode === 'devel' ? '.env.devel' : '.env.prod' });

const config = {
    SERVER: 'MongoDB',
    APP_NAME: 'TOMAS_APP',
    PORT: process.env.PORT || clOptions.port || 8080,
    DIRNAME: path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, '$1')), // Win
    // UPLOAD_DIR: 'public/img'
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/img`; },
    MONGODB_URI: process.env.MONGODB_URI,
    // MONGODB_URI2: process.env.MONGODB_URI2",
    MONGODB_ID_REGEX: new RegExp(process.env.MONGODB_ID_REGEX),
    SECRET: process.env.SECRET,
    PERSISTENCE:process.env.PERSISTENCE,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
    GOOGLE_USER:"locoarts123@gmail.com",
    GOOGLE_APLICATION_PASSWORD:"qcpd ocvu quct tdcv",

    // GOOGLE_USER: process.env.GOOGLE_USER,
    // GOOGLE_APLICATION_PASSWORD: process.env.GOOGLE_APLICATION_PASSWORD,
};

export default config