"use strict"

const { Matchers } = require("@pact-foundation/pact")
const { getClients, getClient, postClient } = require("../../../src/consumer")

describe('Clients Service', () => {
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