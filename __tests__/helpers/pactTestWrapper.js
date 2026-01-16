jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000

beforeAll(() => {
  return provider.setup()
})

afterAll(() => {
  return provider.finalize()
})