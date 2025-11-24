export const createResponseWithOneError = (errorMessage: string) => {
  return {
    errors: [{ message: errorMessage }],
  }
}

export const createResponseWithOneErrorMessageAndCode = (errorMessage: string, code: string) => {
  return {
    errors: [{ message: errorMessage, code }],
  }
}
