'use strict';

const request = require('supertest');
const app = require('./app');

describe('Test page', () => {

	test('GET / succeeds', () => {

		return request(app)
			.get('/')
			.expect(200);

	});

});