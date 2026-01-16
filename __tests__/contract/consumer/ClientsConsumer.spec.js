"use strict"

const path = require("path")
const { PactV3, MatchersV3 } = require("@pact-foundation/pact")

const { like } = MatchersV3

const { getClients, getClient, postClient, putClient, deleteClient } = require("../../../src/consumer")

const provider = new PactV3({
  dir: path.resolve(process.cwd(), "__tests__/contract/pacts"),
  consumer: "Frontend",
  provider: "ClientsService",
})

const GET_ALL_CLIENTS = [
  { firstName: "Lisa", lastName: "Simpson", age: 8, id: 1 },
  { firstName: "Wonder", lastName: "Woman", age: 30, id: 2 },
  { firstName: "Homer", lastName: "Simpson", age: 39, id: 3 }
]

const LISA_CLIENT = { firstName: "Lisa", lastName: "Simpson", age: 8, id: 1 }

describe("Clients Service", () => {

  describe("GET Clients", () => {
    test("returns all clients", async () => {
      provider
        .given("i have a list of clients")
        .uponReceiving("a request for all clients")
        .withRequest({
          method: "GET",
          path: "/clients",
          headers: { Accept: "application/json, text/plain, */*" },
        })
        .willRespondWith({
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: GET_ALL_CLIENTS,
        })

      await provider.executeTest(async (mockServer) => {
        process.env.API_ENDPOINT = mockServer.url
        const response = await getClients()
        expect(response.status).toEqual(200)
        expect(response.data).toEqual(GET_ALL_CLIENTS)
      })
    })
  })

  describe("GET Client ID", () => {
    test("returns client by id", async () => {
      provider
        .given("i have a client for ID")
        .uponReceiving("a request for id client")
        .withRequest({
          method: "GET",
          path: "/clients/1",
          headers: { Accept: "application/json, text/plain, */*" },
        })
        .willRespondWith({
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: LISA_CLIENT,
        })

      await provider.executeTest(async (mockServer) => {
        process.env.API_ENDPOINT = mockServer.url
        const response = await getClient(1)
        expect(response.status).toEqual(200)
        expect(response.data).toEqual(LISA_CLIENT)
      })
    })
  })

  describe("POST Client", () => {
    const POST_BODY = { firstName: "Wendy", lastName: "Monteiro", age: 25 }
    const POST_EXPECTED = { firstName: "Wendy", lastName: "Monteiro", age: 25, id: 4 }

    test("creates a new client", async () => {
      provider
        .given("i create a new client")
        .uponReceiving("a request to create client with firstname and lastname")
        .withRequest({
          method: "POST",
          path: "/clients",
          headers: { "Content-Type": "application/json" },
          body: POST_BODY,
        })
        .willRespondWith({
          status: 200,
          body: like(POST_EXPECTED),
        })

      await provider.executeTest(async (mockServer) => {
        process.env.API_ENDPOINT = mockServer.url
        const response = await postClient(POST_BODY)
        expect(response.status).toEqual(200)
        expect(response.data.id).toEqual(4)
      })
    })
  })

  describe("PUT Client", () => {
    const PUT_BODY = { firstName: "Lisa Marie", age: 9 }
    const PUT_EXPECTED = { firstName: "Lisa Marie", lastName: "Simpson", age: 9, id: 1 }

    test("updates an existing client", async () => {
      provider
        .given("i have a client for ID")
        .uponReceiving("a request to update a client")
        .withRequest({
          method: "PUT",
          path: "/clients/1",
          headers: { "Content-Type": "application/json" },
          body: PUT_BODY,
        })
        .willRespondWith({
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: like(PUT_EXPECTED),
        })

      await provider.executeTest(async (mockServer) => {
        process.env.API_ENDPOINT = mockServer.url
        const response = await putClient(1, PUT_BODY)
        expect(response.status).toEqual(200)
        expect(response.data.firstName).toEqual("Lisa Marie")
      })
    })
  })

  describe("DELETE Client", () => {
    test("deletes a client", async () => {
      provider
        .given("i have a client for ID")
        .uponReceiving("a request to delete a client")
        .withRequest({
          method: "DELETE",
          path: "/clients/1",
        })
        .willRespondWith({
          status: 204,
        })

      await provider.executeTest(async (mockServer) => {
        process.env.API_ENDPOINT = mockServer.url
        const response = await deleteClient(1)
        expect(response.status).toEqual(204)
      })
    })
  })

  describe("GET Client - Not Found", () => {
    test("returns 404 when client not found", async () => {
      provider
        .given("client does not exist")
        .uponReceiving("a request for a non-existent client")
        .withRequest({
          method: "GET",
          path: "/clients/999",
          headers: { Accept: "application/json, text/plain, */*" },
        })
        .willRespondWith({
          status: 404,
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: { message: "Client not found!" },
        })

      await provider.executeTest(async (mockServer) => {
        process.env.API_ENDPOINT = mockServer.url
        const response = await getClient(999)
        expect(response.status).toEqual(404)
        expect(response.data.message).toEqual("Client not found!")
      })
    })
  })

  describe("POST Client - Validation Error", () => {
    const INVALID_BODY = { lastName: "NoFirstName", age: 30 }

    test("returns 400 when firstName is missing", async () => {
      provider
        .given("i create a new client")
        .uponReceiving("a request to create client without firstName")
        .withRequest({
          method: "POST",
          path: "/clients",
          headers: { "Content-Type": "application/json" },
          body: INVALID_BODY,
        })
        .willRespondWith({
          status: 400,
          body: like({ message: "Missing first name!" }),
        })

      await provider.executeTest(async (mockServer) => {
        process.env.API_ENDPOINT = mockServer.url
        const response = await postClient(INVALID_BODY)
        expect(response.status).toEqual(400)
        expect(response.data.message).toEqual("Missing first name!")
      })
    })
  })

  describe("PUT Client - Not Found", () => {
    const PUT_BODY = { firstName: "Ghost" }

    test("returns 404 when updating non-existent client", async () => {
      provider
        .given("client does not exist")
        .uponReceiving("a request to update a non-existent client")
        .withRequest({
          method: "PUT",
          path: "/clients/999",
          headers: { "Content-Type": "application/json" },
          body: PUT_BODY,
        })
        .willRespondWith({
          status: 404,
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: { message: "Client not found!" },
        })

      await provider.executeTest(async (mockServer) => {
        process.env.API_ENDPOINT = mockServer.url
        const response = await putClient(999, PUT_BODY)
        expect(response.status).toEqual(404)
        expect(response.data.message).toEqual("Client not found!")
      })
    })
  })

  describe("DELETE Client - Not Found", () => {
    test("returns 404 when deleting non-existent client", async () => {
      provider
        .given("client does not exist")
        .uponReceiving("a request to delete a non-existent client")
        .withRequest({
          method: "DELETE",
          path: "/clients/999",
        })
        .willRespondWith({
          status: 404,
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: { message: "Client not found!" },
        })

      await provider.executeTest(async (mockServer) => {
        process.env.API_ENDPOINT = mockServer.url
        const response = await deleteClient(999)
        expect(response.status).toEqual(404)
        expect(response.data.message).toEqual("Client not found!")
      })
    })
  })
})
