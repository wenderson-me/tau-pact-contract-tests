"use strict"

const path = require("path")
const { Pact, Matchers } = require("@pact-foundation/pact")

const PACT_PORT = 8082
process.env.API_ENDPOINT = `http://localhost:${PACT_PORT}`

const { getClients, getClient, postClient, putClient, deleteClient } = require("../../../src/consumer")

const provider = new Pact({
  port: PACT_PORT,
  log: path.resolve(process.cwd(), "__tests__/contract/logs", "mockserver-integration.log"),
  dir: path.resolve(process.cwd(), "__tests__/contract/pacts"),
  spec: 2,
  logLevel: 'INFO',
  pactfileWriteMode: "overwrite",
  consumer: "Frontend",
  provider: "ClientsService",
})

describe('Clients Service', () => {

  beforeAll(() => provider.setup())
  afterAll(() => provider.finalize())

  const GET_EXPECTED_BODY = [{
    "firstName": "Lisa",
    "lastName": "Simpson",
    "age": 8,
    "id": 1
  },
  {
    "firstName": "Wonder",
    "lastName": "Woman",
    "age": 30,
    "id": 2
  },
  {
    "firstName": "Homer",
    "lastName": "Simpson",
    "age": 39,
    "id": 3
  }]

  afterEach(() => provider.verify())

  describe("GET Clients", () => {
    beforeEach(() => {
      const interaction = {
        state: "i have a list of clients",
        uponReceiving: "a request for all clients",
        withRequest: {
          method: "GET",
          path: "/clients",
          headers: {
            Accept: "application/json, text/plain, */*",
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: GET_EXPECTED_BODY,
        },
      }
      return provider.addInteraction(interaction)
    })

    test("returns correct body, header and statusCode", async () => {
      const response = await getClients()
      expect(response.headers['content-type']).toBe("application/json; charset=utf-8")
      expect(response.data).toEqual(GET_EXPECTED_BODY)
      expect(response.status).toEqual(200)
    })
  })

  describe('GET Client ID', () => {

    const GET_EXPECTED_BODY = {
      "firstName": "Lisa",
      "lastName": "Simpson",
      "age": 8,
      "id": 1
    }

    beforeEach(() => {
      const interaction = {
        state: "i have a client for ID",
        uponReceiving: "a request for id client",
        withRequest: {
          method: "GET",
          path: "/clients/1",
          headers: {
            Accept: "application/json, text/plain, */*",
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: GET_EXPECTED_BODY,
        },
      }
      return provider.addInteraction(interaction)
    })

    test('returns correct body, header and statusCode', async () => {
      const response = await getClient(1)
      expect(response.headers['content-type']).toBe("application/json; charset=utf-8")
      expect(response.data).toEqual(GET_EXPECTED_BODY)
      expect(response.status).toEqual(200)
    });
  });

  describe("POST Client", () => {

    const POST_BODY = {
      firstName: "Wendy",
      lastName: "Monteiro",
      age: 25,
    }
    const POST_EXPECTED_BODY = {
      firstName: POST_BODY.firstName,
      lastName: POST_BODY.lastName,
      age: POST_BODY.age,
      id: 4
    }

    beforeEach(() => {
      const interaction = {
        state: "i create a new client",
        uponReceiving: "a request to create client with firstname and lastname",
        withRequest: {
          method: "POST",
          path: "/clients",
          headers: {
            "Content-Type": "application/json;charset=utf-8"
          },
          body: POST_BODY,
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(POST_EXPECTED_BODY).contents,
        },
      }
      return provider.addInteraction(interaction)
    })

    test("returns correct body, header and statusCode", async () => {
      const response = await postClient(POST_BODY)
      console.log(response.data)
      expect(response.data.id).toEqual(4)
      expect(response.status).toEqual(200)
    })
  })

  describe("PUT Client", () => {

    const PUT_BODY = {
      firstName: "Lisa Marie",
      age: 9
    }
    const PUT_EXPECTED_BODY = {
      firstName: "Lisa Marie",
      lastName: "Simpson",
      age: 9,
      id: 1
    }

    beforeEach(() => {
      const interaction = {
        state: "i have a client for ID",
        uponReceiving: "a request to update a client",
        withRequest: {
          method: "PUT",
          path: "/clients/1",
          headers: {
            "Content-Type": "application/json;charset=utf-8"
          },
          body: PUT_BODY,
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: Matchers.like(PUT_EXPECTED_BODY).contents,
        },
      }
      return provider.addInteraction(interaction)
    })

    test("returns updated client", async () => {
      const response = await putClient(1, PUT_BODY)
      expect(response.data.firstName).toEqual("Lisa Marie")
      expect(response.data.age).toEqual(9)
      expect(response.status).toEqual(200)
    })
  })

  describe("DELETE Client", () => {

    beforeEach(() => {
      const interaction = {
        state: "i have a client for ID",
        uponReceiving: "a request to delete a client",
        withRequest: {
          method: "DELETE",
          path: "/clients/1",
        },
        willRespondWith: {
          status: 204,
        },
      }
      return provider.addInteraction(interaction)
    })

    test("returns 204 no content", async () => {
      const response = await deleteClient(1)
      expect(response.status).toEqual(204)
    })
  })

  describe("GET Client - Not Found", () => {

    beforeEach(() => {
      const interaction = {
        state: "client does not exist",
        uponReceiving: "a request for a non-existent client",
        withRequest: {
          method: "GET",
          path: "/clients/999",
          headers: {
            Accept: "application/json, text/plain, */*",
          },
        },
        willRespondWith: {
          status: 404,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: { message: "Client not found!" },
        },
      }
      return provider.addInteraction(interaction)
    })

    test("returns 404 when client not found", async () => {
      const response = await getClient(999)
      expect(response.status).toEqual(404)
      expect(response.data.message).toEqual("Client not found!")
    })
  })

  describe("POST Client - Validation Error", () => {

    const INVALID_BODY = {
      lastName: "NoFirstName",
      age: 30
    }

    beforeEach(() => {
      const interaction = {
        state: "i create a new client",
        uponReceiving: "a request to create client without firstName",
        withRequest: {
          method: "POST",
          path: "/clients",
          headers: {
            "Content-Type": "application/json;charset=utf-8"
          },
          body: INVALID_BODY,
        },
        willRespondWith: {
          status: 400,
          body: Matchers.like({ message: "Missing first name!" }).contents,
        },
      }
      return provider.addInteraction(interaction)
    })

    test("returns 400 when firstName is missing", async () => {
      const response = await postClient(INVALID_BODY)
      expect(response.status).toEqual(400)
      expect(response.data.message).toEqual("Missing first name!")
    })
  })

  describe("PUT Client - Not Found", () => {

    const PUT_BODY = { firstName: "Ghost" }

    beforeEach(() => {
      const interaction = {
        state: "client does not exist",
        uponReceiving: "a request to update a non-existent client",
        withRequest: {
          method: "PUT",
          path: "/clients/999",
          headers: {
            "Content-Type": "application/json;charset=utf-8"
          },
          body: PUT_BODY,
        },
        willRespondWith: {
          status: 404,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: { message: "Client not found!" },
        },
      }
      return provider.addInteraction(interaction)
    })

    test("returns 404 when updating non-existent client", async () => {
      const response = await putClient(999, PUT_BODY)
      expect(response.status).toEqual(404)
      expect(response.data.message).toEqual("Client not found!")
    })
  })

  describe("DELETE Client - Not Found", () => {

    beforeEach(() => {
      const interaction = {
        state: "client does not exist",
        uponReceiving: "a request to delete a non-existent client",
        withRequest: {
          method: "DELETE",
          path: "/clients/999",
        },
        willRespondWith: {
          status: 404,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
          body: { message: "Client not found!" },
        },
      }
      return provider.addInteraction(interaction)
    })

    test("returns 404 when deleting non-existent client", async () => {
      const response = await deleteClient(999)
      expect(response.status).toEqual(404)
      expect(response.data.message).toEqual("Client not found!")
    })
  })
})