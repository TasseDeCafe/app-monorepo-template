import Stripe from 'stripe'
import { FEATURES } from '@template-app/core/features'
import { getConfig } from '../../../config/environment-config'

export const stripe = FEATURES.STRIPE
  ? new Stripe(getConfig().stripeSecretKey, { apiVersion: '2025-09-30.clover' })
  : (null as unknown as Stripe)
