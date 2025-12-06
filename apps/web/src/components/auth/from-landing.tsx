import { useEffect } from 'react'
import { Navigate, useNavigate, useSearch } from '@tanstack/react-router'
import { Route as dashboardRoute } from '@/routes/_protected/_tabs/dashboard'
import { Route as redirectToCheckOutRoute } from '@/routes/_protected/redirect-to-check-out/$planInterval'
import { FullViewLoader } from '../loader/full-view-loader.tsx'

// all external links going from the landing page to the app are handled in this component
export const FromLanding = () => {
  const { planInterval } = useSearch({ from: '/from-landing' })
  const navigate = useNavigate()

  // If there is a planInterval in the URL, we want the user to be redirected to the checkout page
  // as soon as they sign up or sign in. The problem is that Supabase strips search params from the URL, so we need to
  // redirect the user to a new route that uses a query param in order to preserve the planInterval.
  // The call to the backend is then handled in the component of this route.
  useEffect(() => {
    if (planInterval) {
      navigate({ to: redirectToCheckOutRoute.to, params: { planInterval } })
    }
  }, [planInterval, navigate])

  // If there is no planInterval in the url, we redirect to the home page. If the user is signed out, they
  // will be redirected to the login page because home is a protected route.
  if (!planInterval) {
    return <Navigate to={dashboardRoute.to} />
  } else {
    return <FullViewLoader />
  }
}
