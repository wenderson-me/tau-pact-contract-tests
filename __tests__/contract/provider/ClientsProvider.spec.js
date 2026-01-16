const path = require("path")
const { Verifier } = require("@pact-foundation/pact")
const { server, importData, clientRepository } = require("../../../src/provider")

const PORT = 8083
const SERVER_URL = `http://localhost:${PORT}`
const PACT_FILE = path.resolve(process.cwd(), "__tests__/contract/pacts/Frontend-ClientsService.json")

let serverInstance

beforeAll((done) => {
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
    const resetData = () => {
      clientRepository.clear()
      importData()
      return Promise.resolve()
    }

    const clearData = () => {
      clientRepository.clear()
      return Promise.resolve()
    }

    const stateHandlers = {
      "i have a list of clients": resetData,
      "i have a client for ID": resetData,
      "i create a new client": resetData,
      "client does not exist": clearData
    }

    let opts = {
      provider: "ClientsService",
      logLevel: "INFO",
      providerBaseUrl: SERVER_URL,
      pactUrls: [PACT_FILE],
      stateHandlers: stateHandlers
    }
    return new Verifier(opts).verifyProvider().then(output => {
      console.log("Pact Verification Complete")
      console.log(output)
    })
  })
})