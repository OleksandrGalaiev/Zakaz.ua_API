# Specs

This is a directory for test plans.

---

# Zakaz.ua Checkout Flow - Comprehensive Test Plan

## Document Overview
This test plan covers comprehensive testing scenarios for the Zakaz.ua checkout flow API. The checkout process in this Ukrainian e-commerce platform involves store selection, delivery address management, delivery method selection, payment processing, and order confirmation. This plan is designed for API-level testing using Playwright + TypeScript + ZOD validation framework.

---

## Test Automation Plan & Coverage

This section is the source of truth for what is currently automated, what is automatable next, and what is out-of-scope for API-level testing. The scenario catalogue (Sections A–I) is preserved below for product/QA reference; the matrix here tags each scenario with its automation status.

### Tech stack & conventions
- **Framework:** Playwright `request` fixture only — backend-only (no `page`, no `locator`, no browsers, no screenshots/video/trace).
- **Pattern:** Fluent `RequestHandler` ([utils/reguestHandler.ts](../utils/reguestHandler.ts)) — chain `.url().path().params().body().headers()` then a terminal `GET_Request` / `POST_Request` / `PUT_Request` / `DELETE_Request` / `POST_Request_withSavingState`.
- **Schema validation:** Zod schemas in [jsonSchema/](../jsonSchema/) — one per endpoint, applied with `safeParse` + `z.prettifyError` on failure.
- **Deterministic baselines:** Static expected datasets in [testData/](../testData/) (e.g. `stores.json`) compared against live responses for stable contract assertions.
- **Auth:** One-time login in [tests/auth.setup.ts](../tests/auth.setup.ts) writes `.auth/ZakazUa_StorageState.json`; all `[api]` project tests reuse it via Playwright `storageState` (see [playwright.config.ts](../playwright.config.ts)).
- **Helpers:** Reusable data-shaping helpers in [utils/comonFunction/](../utils/comonFunction/) (e.g. `buildStoreTestDB`).
- **Tags:** `@api` for production tests, `@debug` for work-in-progress.

### Coverage matrix

Legend: ✅ implemented · 🟡 automatable today (no blockers) · ⛔ blocked (missing endpoint/fixture/info) · ❌ out-of-scope for API tests.

| Scenario | Status | Location / target | Notes |
|---|---|---|---|
| **Z1.** Login + persist state | ✅ | [tests/auth.setup.ts](../tests/auth.setup.ts) | Section I (added below). |
| **Z2.** GET `/user/profile/` | ✅ | [tests/ZakazAPI.spec.ts](../tests/ZakazAPI.spec.ts) | Section I (added below). |
| **A1.** Store discovery + schema | ✅ | [tests/ZakazAPI.spec.ts](../tests/ZakazAPI.spec.ts) — `API. Check Stores api response` | GET `/stores/` + `storesJSONSchema`. |
| **A2.1.** id/name/retail_chain per store | ✅ | [tests/ZakazAPI_ClaudeCode.spec.ts](../tests/ZakazAPI_ClaudeCode.spec.ts) | Validates against [testData/stores.json](../testData/stores.json). |
| **A2 (variants).** Chain diversity, distribution, min unique chains | 🟡 | extend A2 spec | Pure derivations from same GET — no new endpoint. |
| **A3.** Store payment methods | 🟡 | new test | Assertions over `payment_types.{pickup,plan,nova_poshta}` arrays. |
| **A4.** Invalid coordinates | 🟡 | new test | Negative path on `/stores/` — expect 4xx. |
| **A5.** Coordinates outside service area | 🟡 | new test | Negative path on `/stores/`. |
| **B1.** GET `/user/delivery` | ✅ | [tests/ZakazAPI.spec.ts](../tests/ZakazAPI.spec.ts) — `API. Check User Delivery` | Schema + key field assertions. |
| **B2.** Per-field delivery validation | 🟡 | extend B1 | Largely overlaps with `userDeliveryJSONSchema`; only add what schema doesn't enforce (ranges, enums). |
| **B3.** Ukrainian characters in address | 🟡 | extend B1 | Single Unicode assertion on existing response. |
| **B4.** Multiple address types (house / office) | ⛔ | — | Test account has only `apartment`; needs additional fixture users or seeded addresses. |
| **C1.** Select home delivery (plan) | 🟡 | new test | Derived from B1 — narrower assertions. |
| **C2.** Pickup + `pickup_zones` | 🟡 | new test | Filter `/stores/` response by `delivery_types` includes `pickup`. |
| **C3.** Nova Poshta filter | 🟡 | new test | Filter `/stores/` response. |
| **C4.** Multi-region delivery (Lviv, Kharkiv) | ⛔ | — | Needs confirmed test coordinates per region. |
| **C5.** Delivery address outside service area | 🟡 | new test | Duplicate of A5 from the delivery angle. |
| **D1–D3.** Payment method selection & per-delivery mapping | 🟡 | new test | All derivable from `/stores/` payload — no POST required. |
| **D4.** Excisable products restriction | 🟡 | new test | Assert `payment_types_for_excisable ⊆ union(payment_types.*)`. |
| **D5.** Payment method unavailable for store | ⛔ | — | Requires order-creation endpoint to surface the rejection. |
| **E1–E8.** Order creation (`POST /orders/`) | ⛔ | — | Endpoint name, request body, and response contract are **not yet documented**. **Action: capture a real checkout via browser dev-tools, write down the endpoint + payload + 2xx/4xx responses, add to this spec, then automate.** |
| **F1–F2, F4–F5, F7.** Order confirmation / receipt | ⛔ | — | Blocked on E (need an order ID to read back). |
| **F3.** Confirmation email | ❌ | — | Requires mail backend hook — out-of-scope for API contract tests. |
| **F6.** Receipt before payment | ⛔ | — | Blocked on E + F1. |
| **G1–G6.** End-to-end checkout flows | ⛔ | — | Compose E + F; same blockers. |
| **H1–H2.** Invalid phone / email | ⛔ | — | Validation surfaces only on order POST (E). |
| **H3.** Slow response handling | ❌ | — | UX/perf concern, not an API contract. |
| **H4.** Service unavailable (503) | ❌ | — | Cannot be deterministically forced against a live service. |

### Implementation priority

**Phase 1 — Read-only contract hardening (no backend writes, no new endpoints):**
1. A2 chain diversity & distribution assertions (extend `tests/ZakazAPI_ClaudeCode.spec.ts`).
2. A3 / D1–D4 — payment-method shape assertions over `/stores/`.
3. B3 Unicode assertion on `/user/delivery`.
4. C2 / C3 — store-list filtering by `delivery_types`.

**Phase 2 — Negative paths on known endpoints:**
5. A4 / A5 — invalid + out-of-area coordinates on `/stores/`.

**Phase 3 — Blocked work (needs discovery before automation):**
6. Capture `POST /orders/` request/response in a browser session; document in this spec; then automate E1.
7. After E1: F1 (read order back) → G1 (end-to-end).
8. Add `house` / `office` fixture addresses → unblock B4.
9. Confirm test coordinates for Lviv / Kharkiv → unblock C4.

**Permanently out-of-scope for this suite** (keep in spec for product reference): F3, H3, H4, and any "user-experience-clear" assertions without a corresponding HTTP-level contract.

### Conventions for adding new tests
- One `test.describe` per endpoint or per scenario group; one `test()` per scenario; `test.step()` for steps inside.
- Always assert against a zod schema when a schema exists; add a schema in `jsonSchema/` first if one doesn't.
- Prefer asserting against a static baseline in `testData/` over re-deriving expected values inside the test.
- Reuse helpers from `utils/comonFunction/`; add new ones there rather than duplicating logic across spec files.
- Tag finished tests `@api`; never commit `@debug` tags to main.

---

## 1. Test Scope

### In Scope
- Store discovery and selection based on location
- User delivery address management and validation
- Delivery method selection (home delivery, pickup, Nova Poshta)
- Payment method selection and validation
- Order creation and confirmation
- Multiple region/city support
- Retail chain support (AlcoHub, Auchan, Biotus, Cosmos, EkoMarket, Epicentr, MasterZoo, MegaMarket, Metro, Novus, UltraMarket, WineTime, Zaraz)

### Out of Scope
- Payment gateway processing (third-party systems)
- Email/SMS notifications
- UI/UX testing (API testing focus)
- Third-party delivery services integration details

---

## 2. Prerequisites & Assumptions

### User & Environment Setup
- Valid test user account with authenticated session
- Environment variables configured: `USER_PHONE`, `USER_EMAIL`, `USER_PASSWORD`
- Test coordinates for Kyiv available: `50.46977,30.605808523043514`
- API base URL: `https://stores-api.zakaz.ua`
- Test user has default delivery address configured
- Fresh state for each test scenario

### Test Data Requirements
- Valid phone number (Ukrainian format)
- Valid email address
- Multiple delivery address options
- At least 3 retail chains available in test region
- Different delivery method options available

---

## 3. Test Scenarios

### SECTION A: STORE DISCOVERY & SELECTION

#### Scenario A1: Discovery - Get Available Stores by Location
**Objective:** Verify user can discover available stores near their location
**Preconditions:**
- User is authenticated
- User location coordinates available

**Steps:**
1. Call GET `/stores/` with parameters:
   - `include_delivery: 1`
   - `coords: 50.46977,30.605808523043514`
   - `delivery_service_id: zakaz`
2. Validate response structure matches `storesJSONSchema`
3. Verify response contains array of stores
4. Verify each store has required fields: id, name, retail_chain, delivery_types, payment_types

**Expected Outcomes:**
- HTTP 200 OK response
- Response is array of store objects
- Minimum 5 stores returned for Kyiv location
- All stores have `is_active: true`
- Response matches ZOD schema validation
- Each store has delivery_types array populated

**Success Criteria:**
- Response validates against schema
- All required store fields present
- Delivery options available for stores
- Response time < 2 seconds

---

#### Scenario A2: Discovery - Filter Stores by Retail Chain
**Objective:** Verify stores are correctly categorized by retail chain
**Preconditions:**
- Store discovery working (Scenario A1 passed)

**Steps:**
1. Call GET `/stores/` with same parameters as A1
2. Parse response and group stores by retail_chain
3. Verify expected retail chains present: alcohub, auchan, biotus, cosmos, ekomarket, epicentr, masterzoo, megamarket, metro, novus, ultramarket, winetime, zaraz
4. For each store, validate retail_chain field matches known chains

**Expected Outcomes:**
- At least 8 different retail chains represented
- No unknown retail_chain values
- Each store belongs to valid retail chain
- Stores properly categorized

**Success Criteria:**
- All stores have valid retail_chain values
- Multiple chains available for testing
- Data consistency maintained

---

#### Scenario A3: Discovery - Verify Store Payment Methods Available
**Objective:** Ensure stores support expected payment methods
**Preconditions:**
- Store discovery completed

**Steps:**
1. Call GET `/stores/` with test coordinates
2. For first 3 stores in response:
   - Extract payment_types object
   - Verify payment_types.pickup contains at least: bank, card_online
   - Verify payment_types.plan contains at least: bank, card_online
3. Verify payment_types_for_excisable array populated
4. Validate payment type values are known types

**Expected Outcomes:**
- Each store supports bank and card_online payment
- Payment methods available for both delivery types
- payment_types_for_excisable properly configured

**Success Criteria:**
- Minimum 2 payment methods per delivery type
- No unknown payment types returned
- Payment configuration consistent

---

#### Scenario A4: Edge Case - Invalid Coordinates Format
**Objective:** Verify API handles invalid coordinate formats gracefully
**Preconditions:**
- None

**Steps:**
1. Call GET `/stores/` with invalid coordinate format:
   - Test with `coords: invalid`
   - Test with `coords: 50.46977` (missing longitude)
   - Test with `coords: 50.46977,30.605808,999` (extra value)
   - Test with `coords: ""` (empty)
   - Test with `coords: null` (null value)
2. Capture HTTP status code and error message
3. Validate error response structure

**Expected Outcomes:**
- Invalid coordinates return HTTP 400 Bad Request
- Error message indicates coordinate format issue
- Response includes helpful error details
- API doesn't crash or return 500 error

**Success Criteria:**
- Proper error handling implemented
- User receives clear error messages
- API stability maintained

---

#### Scenario A5: Edge Case - Coordinates Outside Service Area
**Objective:** Verify behavior when searching outside service region
**Preconditions:**
- None

**Steps:**
1. Call GET `/stores/` with coordinates outside Ukraine:
   - Test with Moscow coordinates: `55.7558,37.6173`
   - Test with London coordinates: `51.5074,-0.1278`
   - Test with coordinates in rural area: `40.0,30.0`
2. Verify response handling
3. Check if empty array or error returned

**Expected Outcomes:**
- Either HTTP 200 with empty array, or HTTP 400/404
- Consistent error handling
- No partial/incorrect data returned

**Success Criteria:**
- API behaves consistently
- No service areas mistaken
- Clear indication of unavailable regions

---

### SECTION B: USER DELIVERY ADDRESS MANAGEMENT

#### Scenario B1: Happy Path - Get Default Delivery Address
**Objective:** Verify user can retrieve their default delivery address
**Preconditions:**
- User is authenticated
- User has default delivery address configured

**Steps:**
1. Call GET `/user/delivery` endpoint
2. Validate response structure matches `userDeliveryJSONSchema`
3. Verify delivery.type equals 'plan' (home delivery)
4. Verify delivery.address.plan contains all required fields
5. Verify coordinates are valid (lat/lng within expected range)
6. Verify region_id and delivery_service_id match expected values

**Expected Outcomes:**
- HTTP 200 OK
- Response contains delivery address object
- Address type is apartment
- Delivery service is 'zakaz'
- Region ID is 'kiev'
- Response validates against ZOD schema

**Success Criteria:**
- All address fields populated
- Address data matches test data
- Schema validation passes
- Coordinates valid for Kyiv region

---

#### Scenario B2: Validation - Delivery Address Fields
**Objective:** Verify all delivery address fields contain valid data
**Preconditions:**
- Scenario B1 passed

**Steps:**
1. Get delivery address from GET `/user/delivery`
2. Validate each field:
   - plan.type: must be 'apartment', 'house', 'office'
   - city: must be non-empty string
   - street: must be non-empty string
   - building: must be non-empty string
   - floor: must be numeric or empty
   - room: must be alphanumeric or numeric
   - entrance: must be numeric or alphanumeric
   - entrance_code: must be numeric or null
   - elevator: must be boolean
   - comments: must be string or empty
   - coords.lat: must be valid latitude (-90 to 90)
   - coords.lng: must be valid longitude (-180 to 180)
   - region_id: must be valid region
   - delivery_service_id: must be 'zakaz'

**Expected Outcomes:**
- All fields pass validation
- No null values in required fields
- Coordinates within valid ranges
- Data types correct for each field

**Success Criteria:**
- 100% field validation success
- No invalid data in response
- Response maintainable for order processing

---

#### Scenario B3: Edge Case - Special Characters in Address
**Objective:** Verify address handles Ukrainian characters correctly
**Preconditions:**
- Address contains Ukrainian characters

**Steps:**
1. Get delivery address from `/user/delivery`
2. Verify Ukrainian characters preserved (street, city names)
3. Verify no character encoding issues
4. Verify special characters in comments handled correctly
5. Verify address can be used in subsequent checkout steps

**Expected Outcomes:**
- Ukrainian characters preserved correctly
- No encoding issues or garbled text
- Address data usable throughout checkout

**Success Criteria:**
- Full support for Cyrillic text
- No data corruption
- Proper UTF-8 encoding maintained

---

#### Scenario B4: Validation - Multiple Address Types
**Objective:** Verify support for different address types
**Preconditions:**
- User has setup different address types

**Steps:**
1. Get delivery address
2. Verify type field supports:
   - apartment (with floor, room, entrance)
   - house (without floor/room)
   - office (business address)
3. For each type, verify required sub-fields present
4. Verify optional fields handled correctly

**Expected Outcomes:**
- All address types supported
- Correct fields for each type
- Proper validation per address type

**Success Criteria:**
- Multiple address types functional
- Type-specific validation working
- Address flexibility supported

---

### SECTION C: DELIVERY METHOD SELECTION

#### Scenario C1: Happy Path - Select Home Delivery (Plan)
**Objective:** Verify user can select home delivery method for checkout
**Preconditions:**
- User has default delivery address
- Store supports 'plan' delivery type
- Delivery address in valid region

**Steps:**
1. Get user delivery address from `/user/delivery`
2. Verify delivery.type equals 'plan'
3. Verify delivery.address.plan fully populated
4. Extract delivery method: plan
5. Extract region_id: 'kiev'
6. Verify delivery_service_id: 'zakaz'
7. Store hash value for later use: delivery.hash

**Expected Outcomes:**
- Home delivery method available
- Address validated
- Delivery parameters available
- Hash value generated for order processing

**Success Criteria:**
- Delivery method properly configured
- Address suitable for delivery
- No delivery restrictions indicated

---

#### Scenario C2: Happy Path - Select Pickup Delivery Method
**Objective:** Verify user can select pickup as delivery method
**Preconditions:**
- Store supports 'pickup' delivery type
- Pickup locations available for store

**Steps:**
1. Get available stores with `/stores/` endpoint
2. Filter for stores with 'pickup' in delivery_types
3. Get pickup_zones from store response
4. Verify pickup_zones array contains location options
5. Select one pickup location
6. Verify pickup has payment_types available

**Expected Outcomes:**
- Pickup option available in stores
- Pickup zones properly listed
- Payment methods available for pickup
- Store hours available for validation

**Success Criteria:**
- Pickup method selectable
- Multiple pickup zones available
- Pickup data complete for order creation

---

#### Scenario C3: Happy Path - Select Nova Poshta Delivery (if available)
**Objective:** Verify alternative delivery service support
**Preconditions:**
- Store supports Nova Poshta delivery
- Nova Poshta service available in region

**Steps:**
1. Get stores with `/stores/` endpoint
2. Filter stores containing 'nova_poshta' in delivery_types
3. Verify Nova Poshta payment methods available
4. Verify store has nova_poshta address information
5. Confirm selection process

**Expected Outcomes:**
- Nova Poshta delivery option available
- Proper payment methods configured
- Address information available

**Success Criteria:**
- Alternative delivery method supported
- Configuration complete
- Ready for order processing

---

#### Scenario C4: Validation - Delivery Service Coverage by Region
**Objective:** Verify delivery service availability by region
**Preconditions:**
- Multiple regions tested

**Steps:**
1. Test coordinates for different regions:
   - Kyiv (current test)
   - Lviv (if available)
   - Kharkiv (if available)
2. For each region:
   - Get stores with `/stores/` endpoint
   - Verify delivery_service matches region configuration
   - Verify delivery_types appropriate for region
3. Validate region_id consistency

**Expected Outcomes:**
- Region-specific delivery options returned
- Correct delivery services per region
- No cross-region delivery conflicts

**Success Criteria:**
- Regional delivery support functional
- Proper service distribution
- Geographic accuracy maintained

---

#### Scenario C5: Edge Case - Delivery Address Outside Service Area
**Objective:** Verify error handling for unavailable delivery areas
**Preconditions:**
- None

**Steps:**
1. Attempt to place order with coordinates outside service area
2. Attempt with address in rural/remote area
3. Attempt with address in different city
4. Capture error responses
5. Verify error messages clear

**Expected Outcomes:**
- Order rejected with appropriate error
- Clear error message about delivery area
- User guided to select available delivery

**Success Criteria:**
- Proper validation in place
- User experience improved with error clarity
- System prevents invalid orders

---

### SECTION D: PAYMENT METHOD SELECTION & VALIDATION

#### Scenario D1: Happy Path - Select Card Online Payment
**Objective:** Verify user can select card online payment method
**Preconditions:**
- Store supports 'card_online' payment
- User has delivery method selected
- Order total calculated

**Steps:**
1. Get store details from `/stores/` response
2. Verify store.payment_types.plan includes 'card_online'
3. Select payment method: 'card_online'
4. Verify payment flow allows card entry
5. Note: Don't actually process real payment in tests

**Expected Outcomes:**
- Card online payment available
- Payment method properly configured
- Ready for payment gateway integration

**Success Criteria:**
- Payment method selectable
- Configuration supports online processing
- Integration point identified

---

#### Scenario D2: Happy Path - Select Bank Transfer Payment
**Objective:** Verify bank transfer payment option available
**Preconditions:**
- Store supports 'bank' payment type
- Bank transfer available for delivery method

**Steps:**
1. Get store payment_types from `/stores/` response
2. Verify 'bank' in payment_types for selected delivery type
3. Select payment method: 'bank'
4. Verify bank details available for order

**Expected Outcomes:**
- Bank transfer option available
- Bank account details available
- Payment method properly configured

**Success Criteria:**
- Alternative payment method working
- Bank details obtainable
- Payment flow supports bank transfer

---

#### Scenario D3: Validation - Payment Method by Delivery Type
**Objective:** Verify payment methods correspond to delivery type
**Preconditions:**
- Multiple delivery types available

**Steps:**
1. For each delivery type (plan, pickup, nova_poshta):
   - Get store with that delivery type
   - Extract payment_types[delivery_type]
   - Verify consistency across stores
   - Verify minimum 2 payment methods per type
2. Compare payment options for each delivery type

**Expected Outcomes:**
- Payment methods vary correctly by delivery type
- Consistent payment method availability
- At least 2 options per type

**Success Criteria:**
- Payment flexibility by delivery type
- No payment method availability issues
- Delivery/payment correlation correct

---

#### Scenario D4: Validation - Excisable Products Payment Restrictions
**Objective:** Verify restricted payment for controlled products
**Preconditions:**
- Order contains excisable items (alcohol, tobacco)

**Steps:**
1. Get store payment_types_for_excisable from `/stores/`
2. Verify it's subset of general payment_types
3. When excisable items in order:
   - Filter payment options to only payment_types_for_excisable
   - Typically card_online only for restricted products
4. Verify user cannot select restricted payment methods
5. Display warning for excisable product restrictions

**Expected Outcomes:**
- Excisable product restrictions enforced
- Limited payment methods for restricted products
- User informed of restrictions
- Only allowed payment methods available

**Success Criteria:**
- Compliance with regulations maintained
- Payment restrictions properly enforced
- User experience clear

---

#### Scenario D5: Edge Case - Payment Method Not Available for Store
**Objective:** Verify error handling when payment method unavailable
**Preconditions:**
- None

**Steps:**
1. Select store that doesn't support card_online
2. Attempt to use card_online payment
3. Select store missing bank transfer option
4. Attempt bank transfer payment
5. Capture error responses

**Expected Outcomes:**
- Selection prevented with error message
- Available payment methods displayed
- User guided to valid options
- No processing with invalid payment method

**Success Criteria:**
- Payment validation working
- User prevented from invalid selections
- Clear error communication

---

### SECTION E: ORDER CREATION & CHECKOUT

#### Scenario E1: Happy Path - Create Order with Home Delivery & Card Payment
**Objective:** Verify complete checkout flow for standard order
**Preconditions:**
- User authenticated
- Delivery address configured
- Store selected with items
- Total calculated

**Steps:**
1. Prepare order object with:
   - Store ID from `/stores/` response
   - Items with quantities, prices
   - Delivery address from `/user/delivery`
   - Delivery method: 'plan'
   - Payment method: 'card_online'
   - Delivery hash value
   - Customer phone and email
2. Call POST `/orders/` (or equivalent) with order data
3. Validate response contains order ID
4. Verify order status is 'created' or 'pending_payment'
5. Validate order total and items

**Expected Outcomes:**
- HTTP 201 Created or 200 OK
- Order ID returned
- Order status: 'pending_payment' or 'pending_confirmation'
- Order preserves all submitted data
- Order timestamp recorded

**Success Criteria:**
- Order successfully created
- All order details preserved
- Ready for payment processing
- Order confirmation available

---

#### Scenario E2: Happy Path - Create Order with Pickup & Bank Payment
**Objective:** Verify checkout with different delivery/payment methods
**Preconditions:**
- Store with pickup and bank payment available

**Steps:**
1. Prepare order with:
   - Pickup location selected
   - Payment method: 'bank'
   - Bank account for transfer
2. Create order via POST
3. Verify order includes bank details
4. Verify pickup location stored
5. Verify bank transfer reference

**Expected Outcomes:**
- Order created successfully
- Pickup information included
- Bank transfer details provided
- User receives order number

**Success Criteria:**
- Alternative method successful
- Order properly configured
- No data loss

---

#### Scenario E3: Validation - Order Total Calculation
**Objective:** Verify accurate order total with all fees
**Preconditions:**
- Order created

**Steps:**
1. Calculate expected total:
   - Items subtotal
   - Delivery fee (if applicable)
   - Service fee (if applicable)
   - Discount (if applicable)
   - Tip (if applicable)
2. Get order from POST response
3. Compare order.total with expected
4. Verify all fees itemized
5. Verify no hidden charges

**Expected Outcomes:**
- Order total matches calculation
- All fees transparent
- Itemized breakdown available
- No discrepancies

**Success Criteria:**
- Financial accuracy maintained
- User trust in pricing
- No calculation errors

---

#### Scenario E4: Validation - Order Item Quantities & Prices
**Objective:** Verify order items and pricing preserved correctly
**Preconditions:**
- Order created with multiple items

**Steps:**
1. Submit order with items:
   - Item 1: Quantity 2, Price 100 UAH = 200 UAH
   - Item 2: Quantity 1, Price 50 UAH = 50 UAH
   - Item 3: Quantity 3, Price 30 UAH = 90 UAH
   - Subtotal: 340 UAH
2. Get order response
3. Verify each item quantity preserved
4. Verify each item price unchanged
5. Verify item line totals correct
6. Verify order subtotal matches

**Expected Outcomes:**
- All quantities preserved
- All prices unchanged
- Line totals correct
- Subtotal accurate

**Success Criteria:**
- Data integrity maintained
- No calculation errors
- Order reflects customer intent

---

#### Scenario E5: Edge Case - Order with Invalid Store ID
**Objective:** Verify error handling for non-existent store
**Preconditions:**
- None

**Steps:**
1. Create order with store_id: '999999999'
2. Verify error response
3. Try with store_id: 'invalid'
4. Try with store_id: null
5. Try with store_id: empty string

**Expected Outcomes:**
- HTTP 400 Bad Request or 404 Not Found
- Error message indicates invalid store
- Order not created
- No data corruption

**Success Criteria:**
- Validation in place
- Clear error messages
- System stability maintained

---

#### Scenario E6: Edge Case - Order with Quantity = 0
**Objective:** Verify validation of item quantities
**Preconditions:**
- None

**Steps:**
1. Create order with item quantity: 0
2. Try negative quantity: -5
3. Try fractional quantity: 2.5
4. Capture error responses

**Expected Outcomes:**
- Quantity 0: rejected with error
- Negative quantities: rejected
- Fractional quantities: rejected or rounded
- Error messages clear

**Success Criteria:**
- Quantity validation working
- Only positive integers accepted
- User prevented from invalid orders

---

#### Scenario E7: Edge Case - Order with Empty Items Array
**Objective:** Verify order requires items
**Preconditions:**
- None

**Steps:**
1. Create order with items: []
2. Try with items: null
3. Try with items undefined

**Expected Outcomes:**
- HTTP 400 Bad Request
- Error: "Order must contain items"
- Order not created

**Success Criteria:**
- Item requirement enforced
- Clear error for empty orders

---

#### Scenario E8: Edge Case - Duplicate Order Submission
**Objective:** Verify handling of repeated order submissions
**Preconditions:**
- Order successfully created

**Steps:**
1. Create order successfully (get order ID)
2. Submit identical order again immediately
3. Submit with same order data + timestamp
4. Verify second submission handled

**Expected Outcomes:**
- First order: created normally
- Second order: either rejected as duplicate, or created as new order
- Behavior consistent and documented
- No data corruption

**Success Criteria:**
- Duplicate detection implemented
- Clear user feedback
- Prevents accidental double charges

---

### SECTION F: ORDER CONFIRMATION & RECEIPT

#### Scenario F1: Happy Path - Get Order Confirmation
**Objective:** Verify order confirmation receipt after successful checkout
**Preconditions:**
- Order successfully created and paid

**Steps:**
1. Create order via POST
2. Get order ID from response
3. Call GET `/orders/{orderId}` or `/order-confirmation/{orderId}`
4. Verify confirmation contains:
   - Order ID
   - Order date/time
   - Store information
   - Delivery address
   - Items list with prices
   - Order total
   - Payment method
   - Delivery method
   - Estimated delivery time
   - Customer support information
5. Validate response against confirmation schema

**Expected Outcomes:**
- HTTP 200 OK
- Complete order details returned
- All confirmation fields present
- Response validates against schema

**Success Criteria:**
- Order confirmation comprehensive
- All required information present
- User has order reference
- Delivery details confirmed

---

#### Scenario F2: Validation - Order Confirmation Data Consistency
**Objective:** Verify confirmation matches submitted order data
**Preconditions:**
- Order confirmed

**Steps:**
1. Store submitted order data (from checkout step)
2. Get order confirmation
3. Compare data:
   - Items match (quantity, price, total)
   - Delivery address matches
   - Payment method matches
   - Delivery method matches
   - Total matches
4. Identify any discrepancies

**Expected Outcomes:**
- Confirmation matches submission
- No data loss or modification
- Total unchanged
- Address preserved exactly

**Success Criteria:**
- Data integrity verified
- Customer receives accurate confirmation
- No surprises in final order

---

#### Scenario F3: Happy Path - Order Confirmation Email Sent
**Objective:** Verify confirmation email delivery
**Preconditions:**
- Order confirmed
- User email: from profile

**Steps:**
1. Create order and confirm
2. Verify email sent to user.email
3. Email should contain:
   - Order ID
   - Order summary
   - Delivery address
   - Estimated delivery time
   - Tracking link (if applicable)
4. Verify email format proper HTML/plain text
5. Verify no sensitive data exposed

**Expected Outcomes:**
- Email sent within 60 seconds of order creation
- Email includes order ID
- Email properly formatted
- No personally sensitive data exposed
- Support contact information included

**Success Criteria:**
- Email delivery confirmed
- Content adequate for customer
- Security maintained

---

#### Scenario F4: Validation - Order Delivery Time Estimation
**Objective:** Verify accurate delivery time estimates
**Preconditions:**
- Order created with delivery

**Steps:**
1. Get order confirmation
2. Extract estimated delivery time
3. Calculate delivery window:
   - Current time + delivery time = estimated delivery
   - For plan delivery: typically 30-60 minutes
   - For pickup: store opening hours
4. Verify estimate is reasonable
5. Verify estimate provided to customer

**Expected Outcomes:**
- Delivery time estimate provided
- Estimate reasonable for delivery type
- Estimate displayed to customer
- Format: time range (e.g., "30-60 minutes")

**Success Criteria:**
- Delivery transparency maintained
- Customer expectations managed
- Time estimates reliable

---

#### Scenario F5: Happy Path - Order Receipt with All Details
**Objective:** Verify comprehensive order receipt
**Preconditions:**
- Order confirmed and paid

**Steps:**
1. Request order receipt via GET `/order-receipt/{orderId}`
2. Verify receipt contains:
   - Invoice number
   - Order date and time
   - Customer name and phone
   - Delivery address with full details
   - Store name and address
   - Item-by-item breakdown
   - Subtotal, delivery fee, service fee, tip, total
   - Payment method and reference
   - Delivery method details
   - Delivery time window
   - Special instructions/comments
   - Driver information (if applicable)
   - Customer support contact
3. Verify receipt formatting professional and readable

**Expected Outcomes:**
- Receipt comprehensive and detailed
- All financial information clear
- Delivery instructions included
- Professional formatting
- Print-friendly format

**Success Criteria:**
- Receipt suitable for customer records
- All information required for accounting
- Professional appearance maintained

---

#### Scenario F6: Edge Case - Request Receipt Before Order Payment
**Objective:** Verify error handling for unpaid orders
**Preconditions:**
- Order created but not paid

**Steps:**
1. Create order without completing payment
2. Request receipt
3. Attempt to access confirmation

**Expected Outcomes:**
- HTTP 403 Forbidden or 400 Bad Request
- Error: "Order not ready" or "Payment pending"
- No receipt generated
- User directed to complete payment

**Success Criteria:**
- Access control implemented
- Users only see confirmed orders
- No premature confirmations

---

#### Scenario F7: Edge Case - Request Receipt for Non-Existent Order
**Objective:** Verify error handling for invalid order IDs
**Preconditions:**
- None

**Steps:**
1. Request receipt for order_id: '999999999'
2. Try order_id: 'invalid'
3. Try order_id: null
4. Try order_id: empty string

**Expected Outcomes:**
- HTTP 404 Not Found
- Error: "Order not found"
- No data exposed
- Clear error message

**Success Criteria:**
- Proper error handling
- No data leakage
- Security maintained

---

### SECTION G: COMPREHENSIVE CHECKOUT FLOW SCENARIOS

#### Scenario G1: End-to-End - Complete Checkout Flow (Happy Path)
**Objective:** Verify entire checkout process from store selection to order confirmation
**Preconditions:**
- Fresh authenticated user session
- Test data available

**Steps:**
1. **Store Discovery:** GET `/stores/` with Kyiv coordinates
2. **Store Selection:** Select first store with both plan + pickup options
3. **Get User Delivery Address:** GET `/user/delivery`
4. **Select Home Delivery:** Choose delivery.type = 'plan'
5. **Select Payment:** Choose 'card_online' payment method
6. **Prepare Order:** Build order object with:
   - 3 items from selected store
   - Subtotal: 500 UAH
   - Delivery fee: 50 UAH (if applicable)
   - Total: 550 UAH
7. **Create Order:** POST `/orders/` with complete order data
8. **Verify Order ID:** Confirm order created with valid ID
9. **Get Confirmation:** GET `/orders/{orderId}`
10. **Verify Delivery Info:** Confirm address, time, method

**Expected Outcomes:**
- All steps successful (HTTP 200-201)
- Order ID generated
- Confirmation contains all details
- Delivery address preserved
- Payment method stored
- Estimated delivery time provided

**Success Criteria:**
- Entire flow working end-to-end
- No data loss at any step
- User receives order confirmation
- Ready for payment processing

---

#### Scenario G2: End-to-End - Checkout with Pickup & Bank Payment
**Objective:** Verify alternative flow with different methods
**Preconditions:**
- Fresh session
- Store with pickup support available

**Steps:**
1. Discover stores
2. Select store with 'pickup' in delivery_types
3. Get pickup_zones from store
4. Select pickup location
5. Verify bank payment available for pickup
6. Prepare order with pickup option
7. Create order with bank_transfer payment
8. Get confirmation
9. Verify bank details provided
10. Verify pickup location included

**Expected Outcomes:**
- Pickup flow successful
- Bank transfer method available
- Pickup location confirmed
- Bank account details provided
- Order ready for customer

**Success Criteria:**
- Alternative flow fully functional
- No issues with pickup selection
- Bank method properly configured

---

#### Scenario G3: Checkout Flow - Multi-Store Comparison
**Objective:** Verify user can compare stores and prices before checkout
**Preconditions:**
- Multiple stores available

**Steps:**
1. Get stores list
2. For first 3 stores:
   - Extract id, name, delivery_types, payment_types
   - Verify opening hours
   - Note delivery fees (if available)
3. Build comparison table
4. Select store with best combination
5. Proceed with checkout
6. Verify selected store used in order

**Expected Outcomes:**
- Store information sufficient for comparison
- User can make informed choice
- Selected store honored in checkout

**Success Criteria:**
- Store data adequate for decision-making
- Comparison process simple and clear
- No switching stores mid-checkout

---

#### Scenario G4: Checkout with Special Instructions
**Objective:** Verify delivery instructions stored and used
**Preconditions:**
- User can add delivery notes

**Steps:**
1. Prepare order with delivery address
2. Add special instructions: "Позвоніть за 5 хвилин, залізні двері, поверх 5"
3. Include in order notes/comments
4. Create order
5. Get confirmation
6. Verify instructions preserved in order
7. Verify driver can access instructions

**Expected Outcomes:**
- Instructions accepted up to reasonable length
- Instructions preserved in confirmation
- Ukrainian characters maintained
- Instructions accessible to driver

**Success Criteria:**
- Special requests supported
- Communication facilitated
- No data corruption with special chars

---

#### Scenario G5: Checkout with Promo Code/Discount
**Objective:** Verify discount application in checkout
**Preconditions:**
- Valid promo code available
- Discount backend functional

**Steps:**
1. Get available stores and items
2. Calculate initial total: 500 UAH
3. Apply promo code: 'WELCOME10'
4. Verify discount calculated: -50 UAH (10%)
5. Verify new total: 450 UAH
6. Create order with discount applied
7. Get confirmation
8. Verify discount line item shown
9. Verify final total reflects discount

**Expected Outcomes:**
- Discount applied correctly
- Discount calculation accurate
- Final total reduced
- Discount shown in confirmation
- No discount double-counting

**Success Criteria:**
- Promo system functional
- Math accurate
- Order confirmation clear about discounts

---

#### Scenario G6: Checkout with Tip Addition
**Objective:** Verify optional tip functionality
**Preconditions:**
- Tip feature available for delivery method

**Steps:**
1. Create order for home delivery
2. Add tip: 50 UAH (standard option)
3. Try custom tip: 100 UAH
4. Try zero tip
5. Calculate new totals
6. Create order with tip
7. Get confirmation
8. Verify tip appears in total
9. Verify tip allocated correctly

**Expected Outcomes:**
- Tip accepted and stored
- Tip added to final total
- Tip shown separately in breakdown
- Custom tip amount allowed
- Zero tip allowed (optional feature)

**Success Criteria:**
- Tip feature optional, not mandatory
- Tip math correct
- Transparent pricing

---

### SECTION H: ERROR SCENARIOS & VALIDATION

#### Scenario H1: Validation - Invalid Phone Number
**Objective:** Verify phone number validation
**Preconditions:**
- None

**Steps:**
1. Attempt order with phone: '123456'
2. Try phone: 'abc'
3. Try phone: '' (empty)
4. Try phone with non-Ukrainian format
5. Try valid format: '+380501234567'

**Expected Outcomes:**
- Invalid formats rejected with error
- Valid Ukrainian format accepted
- Error message indicates phone format requirement

**Success Criteria:**
- Phone validation working
- Clear error messages
- Support for standard formats

---

#### Scenario H2: Validation - Invalid Email Address
**Objective:** Verify email validation in checkout
**Preconditions:**
- None

**Steps:**
1. Try email: 'notanemail'
2. Try email: '@example.com'
3. Try email: 'user@'
4. Try email: '' (empty)
5. Try valid email: 'user@example.com'

**Expected Outcomes:**
- Invalid emails rejected
- Valid format accepted
- Error message specifies email requirement

**Success Criteria:**
- Email validation working
- Professional error handling

---

#### Scenario H3: Timeout - Store Discovery Slow Response
**Objective:** Verify handling of slow API responses
**Preconditions:**
- Network simulation available (optional)

**Steps:**
1. Request `/stores/` with normal connection
2. Verify response time < 2 seconds
3. If network throttling available:
   - Simulate slow connection (3G)
   - Verify timeout handling
   - Verify user feedback

**Expected Outcomes:**
- Normal response time acceptable
- Timeout handled gracefully
- User informed of delay
- Retry mechanism available

**Success Criteria:**
- Performance acceptable
- Good user experience under normal conditions
- Graceful degradation under poor conditions

---

#### Scenario H4: Error - API Service Unavailable
**Objective:** Verify handling when API temporarily down
**Preconditions:**
- None (test against actual service behavior)

**Steps:**
1. Request endpoint during service maintenance
2. Verify HTTP 503 Service Unavailable returned
3. Verify error message user-friendly
4. Verify retry guidance provided
5. Verify user data not lost

**Expected Outcomes:**
- HTTP 503 or appropriate error
- User-friendly error message
- Guidance on what to do
- Temporary failure, not permanent data loss

**Success Criteria:**
- Error handling graceful
- User knows to retry
- Support information available

---

### SECTION I: AUTHENTICATION & USER PROFILE PREREQUISITES

> Added to reflect scenarios already automated but previously absent from this spec. These are prerequisites for every authenticated scenario above.

#### Scenario Z1: Auth - Login and persist session state
**Objective:** Verify the test account can authenticate and that the resulting cookies/session are reusable across the run.
**Preconditions:**
- `.env` provides `USER_PHONE`, `USER_EMAIL`, `USER_PASSWORD`

**Steps:**
1. Call POST `/user/login/` with body `{ login: USER_PHONE, password: USER_PASSWORD }`
2. Verify HTTP 200
3. Persist authenticated `storageState` to `.auth/ZakazUa_StorageState.json` via `POST_Request_withSavingState`
4. All `[api]` Playwright project tests reuse this state (see `playwright.config.ts`)

**Expected Outcomes:**
- HTTP 200 OK
- Storage state file written and non-empty
- Subsequent authenticated GETs succeed without a fresh login

**Success Criteria:**
- One login call per worker
- No auth-related flakiness across the suite
- Credentials read from env only — never hard-coded

**Automation:** ✅ `tests/auth.setup.ts`

---

#### Scenario Z2: User Profile - Verify authenticated user profile response
**Objective:** Verify GET `/user/profile/` returns data consistent with the configured test credentials.
**Preconditions:**
- Z1 passed (authenticated session)
- `USER_PHONE`, `USER_EMAIL` available

**Steps:**
1. Call GET `/user/profile/`
2. Validate response against `userProfileJSONSchema`
3. Assert `login.phone === USER_PHONE`
4. Assert `phones[0].phone === USER_PHONE`
5. Assert `emails[0].email === USER_EMAIL`
6. Assert `name` matches configured first name

**Expected Outcomes:**
- HTTP 200 OK
- Profile fields match the authenticated test account
- Zod schema validation passes

**Success Criteria:**
- Auth + profile data integrity verified before any checkout-flow tests run
- Schema drift detected early via `userProfileJSONSchema`

**Automation:** ✅ `tests/ZakazAPI.spec.ts` — `API. Check user profile response`
