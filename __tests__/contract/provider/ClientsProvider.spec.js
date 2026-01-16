const path = require("path")
const { Verifier } = require("@pact-foundation/pact")
const { server, importData } = require("../../../src/provider")

const PORT = 8083
const SERVER_URL = `http://localhost:${PORT}`
const PACT_FILE = path.resolve(process.cwd(), "__tests__/contract/pacts/frontend-clientsservice.json")

let serverInstance

beforeAll((done) => {
  importData()
  serverInstance = server.listen(PORT, () => {
    console.log(`Clients Service listening on ${SERVER_URL}`)
    done()
  })
})

afterAll((done) => {
  serverInstance.close(done)
})

describe("Clients Service Verification", () => {
  it("validates the expectations of Client Service", () => {
    let opts = {
      provider: "ClientsService",
      logLevel: "INFO",
      providerBaseUrl: SERVER_URL,
      pactUrls: [PACT_FILE],
    }
    return new Verifier(opts).verifyProvider().then(output => {
      console.log("Pact Verification Complete")
      console.log(output)
    })
  })
})