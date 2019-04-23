'use strict';

const request = require('supertest');
const ap = require('./app');
const authCallback = ap.authCallback;
const app = ap.app;


describe('Test the Home page', () => {

	test('GET / succeeds', () => {

		return request(app)
			.get('/')
			.expect(200);

	});

	test('GET / returns HTML', () => {

		return request(app)
			.get('/')
			.expect('Content-type', /html/);

	});

});

describe('Test the /logout', () => {

	test('GET /logout returns 302 to indicate it removed login session and redirected', () => {

		return request(app)
			.get('/logout')
			.expect(302);

	});

});

describe('Test the /details', () => {

	test('GET /details returns 204 as no auth', () => {

		return request(app)
			.get('/details')
			.expect(204);

	});

});

describe('Test the /search', () => {

	test('GET /search returns 500 to indicate there is no auth', () => {

		return request(app)
			.get('/search')
			.expect(500);

	});

});

describe('Test the login workflow', () => {

	test('GET /auth/spotify returns 302 to indicate there is a redirect', () => {

		return request(app)
			.get('/auth/spotify')
			.expect(302);

	});

	test('GET /auth/spotify/callback returns 302 to indicate redirect', () => {

		return request(app)
			.get('/auth/spotify/callback')
			.expect(302);

	});

});

test('Function Test?', async () => {

	let res = {
		redirect: jest.fn()
	};

	// console.log(authCallback(null, res));
	await authCallback(null, res);
	expect(res.redirect.mock.calls.length).toEqual(1);

});

