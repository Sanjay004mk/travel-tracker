import { expect, test } from 'vitest'
import request from 'supertest';
import app from './app.js'

test('hello world test', async () => {
  const res = await request(app).get('/');
  expect(res.statusCode).toEqual(404);
})