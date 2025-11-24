import Stripe from 'stripe'
import { getConfig } from '../../../config/environment-config'

export const stripe = new Stripe(getConfig().stripeSecretKey, { apiVersion: '2025-09-30.clover' })
