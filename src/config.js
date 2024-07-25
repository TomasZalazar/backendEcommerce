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


export const errorsDictionary = {
    UNHANDLED_ERROR: { code: 0, status: 500, message: 'Error no identificado' },
    ROUTING_ERROR: { code: 1, status: 404, message: 'No se encuentra el endpoint solicitado' },
    FEW_PARAMETERS: { code: 2, status: 400, message: 'Faltan parámetros obligatorios o se enviaron vacíos' },
    INVALID_MONGOID_FORMAT: { code: 3, status: 400, message: 'El ID no contiene un formato válido de MongoDB' },
    INVALID_PARAMETER: { code: 4, status: 400, message: 'El parámetro ingresado no es válido' },
    INVALID_TYPE_ERROR: { code: 5, status: 400, message: 'No corresponde el tipo de dato' },
    ID_NOT_FOUND: { code: 6, status: 400, message: 'No existe registro con ese ID' },
    PAGE_NOT_FOUND: { code: 7, status: 404, message: 'No se encuentra la página solicitada' },
    DATABASE_ERROR: { code: 8, status: 500, message: 'No se puede conectar a la base de datos' },
    INTERNAL_ERROR: { code: 9, status: 500, message: 'Error interno de ejecución del servidor' },
    RECORD_CREATION_ERROR: { code: 10, status: 500, message: 'Error al intentar crear el registro' },
    RECORD_CREATION_OK: { code: 11, status: 200, message: 'Registro creado' },
    UNAUTHORIZED: { code: 12, status: 401, message: 'No autorizado: Necesitas estar autenticado para acceder a este recurso.' },
    FORBIDDEN: { code: 13, status: 403, message: 'Prohibido: No tienes los permisos necesarios para realizar esta acción.' }
};


export default config