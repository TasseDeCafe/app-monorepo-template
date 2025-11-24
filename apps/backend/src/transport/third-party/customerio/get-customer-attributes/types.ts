export type CustomerIOAttributesResult =
  | {
      wasSuccessful: false
    }
  | {
      wasSuccessful: true
      data: {
        attributes: Record<string, string>
        unsubscribed: boolean
      }
    }
