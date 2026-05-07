# Zakaz.UA API Test Framework

End-to-end API test suite for the **Zakaz.UA** backend (`https://stores-api.zakaz.ua`). The project is **backend-only** — there are no browser or UI tests.

## Tech Stack

- **[Playwright Test](https://playwright.dev/)** (`@playwright/test`) — test runner and `APIRequestContext` for HTTP calls
- **TypeScript** — strict typing across fixtures, request handler, and schemas
- **[Zod](https://zod.dev/)** (`zod ^4.x`) — runtime JSON schema validation of API responses; failures are pretty-printed via `z.prettifyError`
- **dotenv** — environment variables loaded from `.env`
- **Node.js** (`@types/node`)

## Project Structure

```
.
├── .auth/                       # Persisted Playwright storageState (login cookies)
├── .github/
│   ├── profile/README.md        # This file
│   └── workflows/               # CI definitions
├── jsonSchema/                  # Zod schemas mirroring API response shapes
│   ├── userDelivery.ts
│   └── userProfile.ts
├── tests/
│   ├── auth.setup.ts            # Login flow that saves storageState
│   └── ZakazAPI.spec.ts         # API specs (tagged @api / @debug)
├── utils/
│   ├── fixtures.ts              # Custom Playwright fixtures (api, config)
│   ├── logger.ts                # In-memory request/response log buffer
│   └── reguestHandler.ts        # Fluent-builder HTTP client
├── api-test.config.ts           # Base URL + credential resolution
└── playwright.config.ts         # Projects: setup → api (uses storageState)
```

## Architecture

### Fluent Request Builder
[utils/reguestHandler.ts](../../utils/reguestHandler.ts) exposes a chainable API:

```ts
api.url(config.zakazURL).path('/user/profile/').GET_Request(200)
```

Supported verbs: `GET_Request`, `POST_Request`, `POST_Request_withSavingState`, `PUT_Request`, `DELETE_Request`. Each verb takes the expected status code; mismatches throw with the captured logger trace.

### Custom Fixtures
[utils/fixtures.ts](../../utils/fixtures.ts) extends Playwright's `test` with `api` (a `RequestHandler` instance) and `config` (resolved env config), so specs receive both via destructuring.

### Auth Flow
The `setup` project ([tests/auth.setup.ts](../../tests/auth.setup.ts)) authenticates once and writes `.auth/ZakazUa_StorageState.json`. The `api` project depends on `setup` and reuses the saved cookies via `storageState`.

### Response Validation with Zod
Each endpoint has a Zod schema in [jsonSchema/](../../jsonSchema/). Specs assert business values **and** validate the full payload shape:

```ts
const result = userProfileJSONSchema.safeParse(responseData)
expect(result.success, result.success ? '' : z.prettifyError(result.error)).toBeTruthy()
```

## Environment Variables (`.env`)

| Variable        | Purpose                       |
|-----------------|-------------------------------|
| `USER_PHONE`    | Login phone for Zakaz.UA      |
| `USER_PASSWORD` | Login password                |
| `USER_EMAIL`    | Email used in profile asserts |

## Running Tests

```bash
npx playwright test                  # all tests
npx playwright test --grep @api      # only @api tagged
npx playwright test --grep @debug    # only @debug tagged
npx playwright show-report           # open last HTML report
```
