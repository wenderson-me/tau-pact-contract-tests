<h1 align="center">
    <a href="https://testautomationu.applitools.com/pact-contract-tests/">🔗 Contract Tests with PACT </a>
</h1>
<p align="center">🚀 Contract test</p>

### Requirements ⚙️

Before starting, you will need to have the following tools installed on your machine:
[Git](https://git-scm.com), [Node.js](https://nodejs.org/en/) and [PACT](https://docs.pact.io/).
Besides this, it is good to have an editor to work with the code, such as [VSCode](https://code.visualstudio.com/)

```ruby
# Clone this repository
$ git clone <https://github.com/wenderson-me/tau-pact-contract-tests.git>

# Install dependencies
$ npm install

# Run the provider server
$ npm run provider

# Run the consumer server
$ npm run consumer

# Run the consumer (generate contracts) contract tests
$ npm run test:consumer

# Run the provider (verify contracts) contract tests
$ npm run test:provider

```

### Docker 🐳

```ruby
# Build and run all tests
$ docker compose run --rm tests

# Run only consumer tests
$ docker compose run --rm consumer-tests

# Run only provider tests
$ docker compose run --rm provider-tests

# Development environment (interactive shell)
$ docker compose run --rm dev

```

## Stack

 <p align="center">
  <img src="https://img.shields.io/badge/javascript-000000?style=for-the-badge&logo=javascript"/>
  <img src="https://img.shields.io/badge/pact-000000?style=for-the-badge&logo=pact"/>
  <img src="https://img.shields.io/badge/jest-000000?style=for-the-badge&logo=jest"/>
  <img src="https://img.shields.io/badge/actions-000000?style=for-the-badge&logo=github-actions"/>
 </p>
