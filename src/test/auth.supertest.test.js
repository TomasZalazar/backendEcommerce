import * as chai from 'chai';
import supertest from 'supertest';
import config from '../config.js';

const expect = chai.expect;
const requester = supertest('http://localhost:4000');

const testUser = { firstName: 'Tomas', lastName: 'Zalazar', email: 'Zalazar@gmail.com', password: 'Tomas' };
let jwtToken = '';

describe('Test Integración Users', function () {

    // Test para registrar un nuevo usuario
    it('POST /api/auth/register debe registrar un nuevo usuario', async function () {
        const { statusCode, body } = await requester.post('/api/auth/register').send(testUser);

        expect(statusCode).to.equal(201);
        expect(body).to.have.property('message').eql('Usuario registrado exitosamente');
        expect(body).to.have.property('user');
    });

    // Test para verificar que no se pueda registrar el mismo email
    it('POST /api/auth/register NO debe volver a registrar el mismo email', async function () {
       
        // Segundo intento para registrar el mismo usuario
        const { statusCode, body } = await requester.post('/api/auth/register').send(testUser);

        expect(statusCode).to.equal(401); // Ajusta el código de estado aquí si es necesario
        
    });


    // Test para iniciar sesión con JWT
    it('POST /api/auth/jwtlogin debe ingresar correctamente al usuario con JWT', async function () {
        const { statusCode, headers, body } = await requester.post('/api/auth/jwtlogin').send({
            email: testUser.email,
            password: testUser.password
        });

        expect(statusCode).to.equal(200);
        expect(body).to.have.property('message').eql('Inicio de sesión exitoso');

        // Obtener el token JWT de la cookie
        const cookieData = headers['set-cookie']?.find(cookie => cookie.startsWith(`${config.APP_NAME}_cookie`));
        if (cookieData) {
            jwtToken = cookieData.split(';')[0].split('=')[1];
            expect(cookieData).to.contain(`${config.APP_NAME}_cookie`);
        } else {
            throw new Error('Cookie no encontrada');
        }
    });

    // Test para obtener datos del usuario autenticado
    it('GET /api/auth/current debe retornar datos correctos de usuario', async function () {
        const { statusCode, body } = await requester.get('/api/auth/current').set('Cookie', [`${config.APP_NAME}_cookie=${jwtToken}`]);

        expect(statusCode).to.equal(200);
        expect(body.payload).to.have.property('email').eql(testUser.email);
        expect(body.payload).to.have.property('firstName');
        expect(body.payload).to.have.property('lastName');
    });


});
