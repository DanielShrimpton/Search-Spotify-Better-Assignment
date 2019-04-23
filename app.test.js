'use strict';

const request = require('supertest');
const app = require('./app');


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


describe('Test the /details', () => {

	test('GET /details returns 204 as no auth', () => {

		return request(app)
			.get('/details')
			.expect(204);

	});

});

describe('Test the /logout', () => {

	test('GET /logout returns 200 to indicate it removed login session', () => {

		return request(app)
			.get('/logout')
			.expect(200);

	});

});