import { describe, expect, test } from 'vitest'
import { buildApp } from '../../app'
import request from 'supertest'

describe('email-verification-router', () => {
  test('when valid email is provided', async () => {
    const testApp = buildApp({})
    const response = await request(testApp).post('/api/v1/authentication/send-email-verification').send({
      email: 'test@example.com',
      referral: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
    })

    console.log('response', response.body)

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveProperty('message', 'Verification email sent successfully')
  })

  test('when invalid email is provided', async () => {
    const testApp = buildApp({})
    const response = await request(testApp)
      .post('/api/v1/authentication/send-email-verification')
      .send({ email: 'invalid-email' })

    expect(response.status).toBe(400)
    expect(response.body.data).toHaveProperty('issues')
  })

  test('when email is missing from request body', async () => {
    const testApp = buildApp({})
    const response = await request(testApp).post('/api/v1/authentication/send-email-verification').send({})

    expect(response.status).toBe(400)
    expect(response.body.data).toHaveProperty('issues')
  })
})
