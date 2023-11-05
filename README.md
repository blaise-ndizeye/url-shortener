## Description

**Url Shortener API** service provides functionality for managing shortened URLs. It allows users to generate, create, update, and delete shortened URLs. Users can also fetch the URLs associated with their accounts. This API is useful for building applications that require URL shortening capabilities, such as social media platforms, marketing campaigns, or any application that needs to generate shorter and more manageable URLs.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Usage

> For Users

### `signUp`

- **Description:** Registers a new user.
- **HTTP Method:** POST
- **Endpoint:** `/user/signup`
- **Required Role:** None
- **Request Body:** SignUpDto (username, password)
- **Response:** JWT token

### `signIn`

- **Description:** Authenticates a user.
- **HTTP Method:** POST
- **Endpoint:** `/user/signin`
- **Required Role:** None
- **Request Body:** SignInDto (username, password)
- **Response:** JWT token

### `getAllUsers`

- **Description:** Fetches all users.
- **HTTP Method:** GET
- **Endpoint:** `/user/list`
- **Required Role:** ADMIN
- **Request Body:** None
- **Response:** Array of users (id, username, role)

### `updateUser`

- **Description:** Updates a user's information.
- **HTTP Method:** PUT
- **Endpoint:** `/user`
- **Required Role:** ADMIN, USER
- **Request Body:** UpdateUserDto (username, oldPassword, newPassword)
- **Response:** Updated user information (id, username, role)

### `deleteUser`

- **Description:** Deletes a user.
- **HTTP Method:** DELETE
- **Endpoint:** `/user/:userId`
- **Required Role:** ADMIN
- **Request Parameter:** userId (integer)
- **Response:** None

> For Url

### `getUserUrls`

- **Description:** Fetches the URLs associated with the user.
- **HTTP Method:** GET
- **Endpoint:** `/url/list`
- **Required Role:** ADMIN, USER
- **Request Body:** None
- **Query Parameters:** `filters` UrlFiltersDto (`search: string, expired: boolean`)
- **Response:** Array of URLs

### `createShortenedUrl`

- **Description:** Creates a shortened URL.
- **HTTP Method:** POST
- **Endpoint:** `/url`
- **Required Role:** ADMIN, USER
- **Request Body:** `body` CreateShortenedUrlDto (`originalUrl: string, expirationDate?: Date, password?: string`)
- **Response:** Created shortened URL

### `updateShortenedUrl`

- **Description:** Updates a shortened URL.
- **HTTP Method:** PUT
- **Endpoint:** `/url/:urlId`
- **Required Role:** ADMIN, USER
- **Request Parameters:** `urlId` (number)
- **Request Body:** `body` UpdateShortenedUrlDto (`originalUrl?: string, expirationDate?: Date, password?: string`)
- **Response:** Updated shortened URL

### `deleteShortenedUrl`

- **Description:** Deletes a shortened URL.
- **HTTP Method:** DELETE
- **Endpoint:** `/url/:urlId`
- **Required Role:** ADMIN, USER
- **Request Parameters:** `urlId` (number)
- **Response:** None

I've managed to write only unit tests for this API, please feel free to expand the project, write integration & e2e tests and also add more features.

**Thanks!**
