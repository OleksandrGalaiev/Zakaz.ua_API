# How to Create a Zod Schema for an API Response

This guide walks through the workflow used in this project for adding a new API endpoint test: capture the response → derive a Zod schema → use it in the spec via `safeParse`.

We use the existing `@api` test **`API. Check User Delivery`** ([tests/ZakazAPI.spec.ts](../../tests/ZakazAPI.spec.ts)) and its schema [jsonSchema/userDelivery.ts](../../jsonSchema/userDelivery.ts) as the worked example.

---

## Step 1 — Capture the real response

Before writing a schema, you need a concrete sample of the response. The simplest way is to run the request inside a temporary test and log the body, or copy it from the API logger output (see [utils/logger.ts](../../utils/logger.ts)).

Example response saved as JSON: [examples/userDelivery.response.json](examples/userDelivery.response.json).

```json
{
    "delivery": {
        "type": "plan",
        "address": {
            "plan": {
                "type": "apartment",
                "city": "Київ",
                "building": "1",
                "company_name": null,
                "block": null,
                "elevator": true,
                "coords": { "lng": 30.5234, "lat": 50.4501 },
                "region_id": "kiev",
                "delivery_service_id": "zakaz"
            },
            "pickup": null,
            "nova_poshta": null
        },
        "hash": "a1b2c3d4..."
    }
}
```

> Save the sample under `.github/instructions/examples/` next to the schema documentation so future contributors can see what the schema is meant to validate.

---

## Step 2 — Map JSON types to Zod primitives

Walk the JSON and translate each leaf value to its Zod counterpart:

| JSON value             | Zod type                          |
|------------------------|-----------------------------------|
| `"some text"`          | `z.string()`                      |
| `42`, `30.5234`        | `z.number()`                      |
| `true`, `false`        | `z.boolean()`                     |
| `null`                 | `z.null()`                        |
| `null` *or a value*    | `z.string().nullable()` (etc.)    |
| `{ ... }`              | `z.object({ ... })`               |
| `[ ... ]`              | `z.array(<itemSchema>)`           |
| missing on some calls  | `.optional()`                     |
| enum-like fixed values | `z.enum(['apartment', 'office'])` |

**Rule of thumb:** if you have only seen `null` for a field, declare it as `z.null()`. If you've also seen a non-null value (or expect one), use `.nullable()`.

---

## Step 3 — Build the schema bottom-up

Compose the schema mirroring the response tree. Inner objects first, then wrap them.

```ts
import { z } from 'zod'

export const userDeliveryJSONSchema = z.object({
    delivery: z.object({
        type: z.string(),
        address: z.object({
            plan: z.object({
                type: z.string(),
                city: z.string(),
                street: z.string(),
                building: z.string(),
                floor: z.string(),
                room: z.string(),
                company_name: z.null(),
                block: z.string().nullable(),
                entrance: z.string(),
                id: z.string(),
                entrance_code: z.string(),
                elevator: z.boolean(),
                comments: z.string(),
                coords: z.object({
                    lng: z.number(),
                    lat: z.number(),
                }),
                region_id: z.string(),
                delivery_service_id: z.string(),
            }),
            pickup: z.null(),
            nova_poshta: z.null(),
            nova_poshta_fresh: z.null(),
            nova_poshta_address: z.null(),
        }),
        hash: z.string(),
    }),
})
```

Save the file as `jsonSchema/<endpointName>.ts` and `export` the schema.

> See the working file: [jsonSchema/userDelivery.ts](../../jsonSchema/userDelivery.ts).

---

## Step 4 — Use the schema in a test

Inside a spec, call the endpoint via the fluent `api` fixture, run business assertions, then validate the **whole** payload shape with `safeParse`. Use `z.prettifyError` to surface a readable diff when validation fails.

```ts
import { expect } from '@playwright/test'
import { test } from '../utils/fixtures'
import z from 'zod'
import { userDeliveryJSONSchema } from '../jsonSchema/userDelivery'

test('API. Check User Delivery', { tag: '@api' }, async ({ api, config }) => {
    const responseData = await api
        .url(config.zakazURL)
        .path('/user/delivery')
        .GET_Request(200)

    // Business-level asserts
    expect(responseData.delivery.address.plan.type).toEqual('apartment')
    expect(responseData.delivery.address.plan.region_id).toEqual('kiev')
    expect(responseData.delivery.address.plan.delivery_service_id).toEqual('zakaz')

    // Full-shape validation
    const parsed = userDeliveryJSONSchema.safeParse(responseData)
    expect(
        parsed.success,
        parsed.success ? '' : z.prettifyError(parsed.error),
    ).toBeTruthy()
})
```

---

## Step 5 — Iterate when the API drifts

When a test starts failing because the schema rejects a payload:

1. Read the `z.prettifyError` output — it points at the path and the expected vs actual type.
2. Decide whether the change is a **bug** in the API (file it) or an **intended evolution** (update the schema and the JSON sample under `examples/`).
3. Prefer narrowing (`z.enum`, `.min`, `.max`, `.uuid()`) over loosening (`z.any()`) — strict schemas catch regressions early.

---

## Checklist

- [ ] Sample response captured in `.github/instructions/examples/<name>.response.json`
- [ ] Schema file in `jsonSchema/<name>.ts`, exported with a descriptive name
- [ ] Spec uses both **business assertions** and `safeParse` + `z.prettifyError`
- [ ] Nullable vs always-null fields are distinguished (`.nullable()` vs `z.null()`)
- [ ] No `z.any()` / `z.unknown()` left in the schema
