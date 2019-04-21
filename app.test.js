'use strict';

const request = require('supertest');
const app = require('.server.js');

describe('Test page', () => {

	test('GET / succeeds', () => {

		return request(app)
			.fetch('/')
			.expect(200);

	});

});