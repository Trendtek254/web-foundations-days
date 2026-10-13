TicketHub — System Design

1. Requirements

Functional Requirements

1. Users can register, log in, and manage their accounts.
2. Users can browse, search, and view concert and event details.
3. Users can view seating arrangements and current seat availability.
4. Users can temporarily hold available seats while completing checkout.
5. Users can pay for their reservations and receive digital tickets.
6. Users can view their orders and purchased tickets.
7. Administrators can create events, manage seats, and monitor ticket sales.

Non-Functional Requirements

Speed: Event pages should load within 2 seconds for most normal requests. Seat reservations should respond quickly, even during a sale.

Correctness: A seat must never be sold to two customers. Payments must be verified before tickets are confirmed, and repeated requests must not create duplicate orders.

Fairness: Customers should have a fair opportunity to purchase tickets. A virtual waiting room should control access during major sales. Queue positions should follow a transparent policy, and automated requests should be rate-limited to reduce bot abuse.

Scalability: The system must support 2 million registered users and handle sudden traffic spikes.

Availability: Browsing should remain available during heavy demand, with monitoring and recovery mechanisms for failures.

Security: Use HTTPS, authentication, authorization, secure password hashing, and verified payment notifications.

Reliability: Store confirmed orders and payments persistently, and recover safely from interrupted requests.

2. Traffic Estimates

Normal Traffic

Given:

- Registered users: 2,000,000
- Daily visitors: 50,000
- Pages viewed per visitor: 10
- Daily ticket sales: 5,000

Daily page views:

50,000 × 10 = 500,000 page views per day.

Average page requests per second:

500,000 ÷ 86,400 = approximately 5.8 requests per second.

Assuming peak browsing traffic is 10 times the average:

5.8 × 10 = approximately 58 requests per second.

Average ticket sales:

5,000 ÷ 86,400 = approximately 0.058 tickets per second.

These figures are estimates; actual traffic varies throughout the day.

Big-Sale Traffic

During a popular concert sale:

- 200,000 people try to purchase tickets.
- Only 20,000 seats are available.
- The rush happens within 10 minutes.

Average incoming purchase attempts:

200,000 ÷ 600 = approximately 333 attempts per second.

Demand-to-supply ratio:

200,000 ÷ 20,000 = 10 potential buyers per seat.

Only 10% of potential buyers can obtain seats if all seats are sold.

Metric| Normal day| Big sale
Daily visitors / potential buyers| 50,000| 200,000 in 10 minutes
Page views| 500,000/day| Depends on browsing behavior
Average browsing requests| 5.8/second| At least 333 purchase attempts/second on average
Peak planning estimate| 58 requests/second| 333 purchase attempts/second average, with higher instantaneous peaks
Tickets available/sold| 5,000 sold/day| 20,000 available

The big sale produces an average purchase-attempt rate roughly 57 times the normal average page-request rate. These are different request types, so the ratio illustrates the change in pressure rather than a direct like-for-like comparison.

Scaling Strategy

- Cache public event pages and static assets.
- Use a CDN to reduce origin-server traffic.
- Use a load balancer and multiple application servers.
- Introduce a virtual waiting room to regulate checkout traffic.
- Use database transactions and constraints to protect seat allocation.
- Monitor latency, queue length, database load, and payment failures.

3. API Design

TicketHub provides a REST API using HTTPS and JSON.

Method| Endpoint| Purpose
GET| "/api/events"| Browse and search events
GET| "/api/events/{eventId}"| View event details
GET| "/api/events/{eventId}/seats"| View seat availability
POST| "/api/holds"| Temporarily hold selected seats
GET| "/api/holds/{holdId}"| Check hold status
POST| "/api/orders"| Create an order from a valid hold
POST| "/api/orders/{orderId}/pay"| Initiate payment
GET| "/api/tickets"| View the authenticated user's tickets
GET| "/api/orders/{orderId}"| View order status

Example: Hold seats

"POST /api/holds"

{
  "eventId": 101,
  "seatIds": [501, 502]
}

The server verifies that the seats are available and atomically holds them for a limited period.

A successful response includes a hold ID and expiration time. If a requested seat has already been held or sold, the server returns HTTP 409 Conflict.

API protections

- Authenticate requests that create holds, orders, or payments.
- Validate seat IDs and ownership on the server.
- Use idempotency keys to prevent duplicate orders and payments.
- Verify payment-provider notifications before confirming an order.
- Never trust seat availability or prices supplied by the browser.

4. Database Design

Use a relational database such as PostgreSQL because transactions and constraints help maintain correct bookings.

Users

- "user_id" — Primary key
- "name"
- "email" — Unique
- "password_hash"
- "created_at"

Stores customer accounts.

Events

- "event_id" — Primary key
- "title"
- "venue"
- "event_date"
- "status"

Stores concert and event information.

Seats

- "seat_id" — Primary key
- "event_id" — Foreign key referencing Events
- "section"
- "row_number"
- "seat_number"
- "status"

A unique constraint on "(event_id, section, row_number, seat_number)" prevents duplicate seat definitions for an event.

Orders

- "order_id" — Primary key
- "user_id" — Foreign key referencing Users
- "status"
- "total_amount"
- "idempotency_key" — Unique
- "created_at"

Stores customer purchases and their statuses.

Seat Holds

- "hold_id" — Primary key
- "user_id" — Foreign key referencing Users
- "event_id" — Foreign key referencing Events
- "expires_at"
- "status"

Stores temporary seat reservations.

Order Items

- "order_id" — Foreign key referencing Orders
- "event_id"
- "seat_id"
- "price"
- Composite primary key: "(event_id, seat_id)"

Represents seats allocated to orders. The database must also enforce uniqueness for active seat allocations and confirmed ticket ownership, with appropriate transactional updates when a hold expires or an order is cancelled.

Relationships

- One user can create many orders and seat holds.
- One event has many seats.
- One user can create many holds.
- One hold can contain multiple seats.
- One order can contain multiple seats through Order Items.
- Each order belongs to one user.
- Each order item references a seat for a specific event.

5. Preventing Double-Booking

The database is the final authority on seat availability. Checking availability in the frontend alone is insufficient because two customers can select the same seat at almost exactly the same time.

TicketHub uses PostgreSQL transactions, row-level locks, and database constraints to ensure that only one customer can successfully hold a particular seat for an event.

Example transaction using SELECT FOR UPDATE

The following simplified SQL demonstrates the core reservation logic. Assume "event_seats" contains one row for each seat at each event, with a status such as AVAILABLE, HELD, or SOLD.

BEGIN;

-- Lock the requested seat so concurrent transactions
-- cannot allocate it simultaneously.
SELECT status
FROM event_seats
WHERE event_id = 101
  AND seat_id = 501
FOR UPDATE;

-- Application logic checks the returned status.
-- Continue only if the seat is AVAILABLE.

UPDATE event_seats
SET status = 'HELD'
WHERE event_id = 101
  AND seat_id = 501
  AND status = 'AVAILABLE';

-- Application checks that exactly one row was updated.
-- If zero rows were updated, reject the reservation
-- and roll back the transaction.

INSERT INTO seat_holds (
    hold_id,
    user_id,
    event_id,
    seat_id,
    status,
    expires_at
)
VALUES (
    'hold_123',
    42,
    101,
    501,
    'HELD',
    CURRENT_TIMESTAMP + INTERVAL '10 minutes'
);

COMMIT;

This is illustrative SQL; production code must implement the conditional update, check its affected-row count, and roll back if the seat is unavailable. The hold record and seat status must change atomically.

What happens when two users compete?

Suppose Alice and Bob both request seat 501:

1. Alice's transaction locks the seat row first.
2. Bob's transaction attempts to lock the same row and must wait.
3. Alice checks that the seat is AVAILABLE, changes its status to HELD, and commits.
4. Bob obtains the lock after Alice commits and sees that the seat is no longer AVAILABLE.
5. Bob's reservation is rejected, and the API returns HTTP 409 Conflict.

If Alice's transaction rolls back instead, Bob can proceed if the seat remains available.

Database constraints

Row locks protect concurrent operations, while database constraints provide an additional layer of protection.

- Use a primary key on "(event_id, seat_id)" in the seat inventory table.
- Use foreign keys to ensure that reservations reference valid users, events, and seats.
- Use a unique constraint on "(event_id, seat_id)" in the active seat-allocation table so the same seat cannot have two active allocations.
- Use a unique idempotency key for order creation to prevent duplicate orders from retried requests.

The database must also handle expired holds safely. A background worker can release expired seats using a transaction that verifies the hold is still active and has not been converted into a confirmed booking.

Payment and ticket confirmation

The system should not keep a database row lock open while waiting for an external payment provider.

Instead, TicketHub creates a time-limited hold, initiates payment, verifies the payment result, and then finalizes the order and ticket allocation through an idempotent workflow.

If payment fails or the hold expires, the system releases the seat safely. If payment succeeds but the application encounters an error, retries and reconciliation must recover the correct booking state without issuing duplicate tickets.

The essential rule is that every successful allocation must pass through the same database-enforced reservation process. Checking availability in the browser or relying on a cached value is never enough.


6. Architecture Diagram

             Customers / Browsers
                      |
                      v
                  DNS Service
                      |
                      v
                 CDN / Cache
                      |
                      v
                Load Balancer
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
      App Server  App Server  App Server
          |           |           |
          +-----------+-----------+
                      |
                      v
             Booking / Event APIs
                      |
            +---------+---------+
            |                   |
            v                   v
      PostgreSQL DB       Payment Provider
            |
            v
      Background Workers
       /              \
      v                v
 Expire Holds      Send Tickets

Component Explanation

DNS: Directs customers to TicketHub's service address.

CDN and Cache: Serve static files and cacheable event information, reducing load on application servers. Seat ownership must not depend on stale cached data.

Load Balancer: Distributes requests across healthy application servers.

Application Servers: Run business logic and authenticate requests. Multiple instances allow horizontal scaling.

Booking and Event APIs: Handle event browsing, seat holds, orders, and checkout.

PostgreSQL: Stores users, events, seats, holds, and orders. Transactions and constraints enforce booking correctness.

Payment Provider: Processes payments and communicates results through verified notifications.

Background Workers: Expire abandoned holds, retry safe tasks, reconcile payment outcomes, and send ticket confirmations.

Virtual Waiting Room: During a major sale, a queue should sit before checkout and release customers at a controlled rate. It can be implemented at the edge or as a dedicated service.

How the Architecture Survives the Big Sale

The CDN absorbs much of the browsing traffic. The load balancer distributes incoming requests, while multiple application servers handle concurrent customers.

The virtual waiting room limits how many purchase attempts reach the database simultaneously. The booking service uses transactions and uniqueness constraints to prevent double-booking even if requests arrive together.

Background workers handle tasks such as hold expiration and email delivery so these tasks do not slow checkout. Monitoring and horizontal scaling help the system respond to rising demand.

7. Trade-offs

Trade-off 1: Consistency vs. Availability

Decision: Prioritize correct seat allocation using database transactions and constraints.

Advantage: The same seat cannot be sold twice.

Disadvantage: Concurrent requests may wait or fail temporarily when the database experiences contention.

Reason: Correct ticket ownership is more important than accepting every request immediately.

Trade-off 2: Virtual Queue vs. Immediate Checkout

Decision: Introduce a waiting room for high-demand sales.

Advantage: Smooths traffic, protects the database, and supports a fairer purchasing process.

Disadvantage: Customers wait longer, and the queue adds operational complexity.

Reason: There are ten potential buyers for every available seat in the popular-concert scenario.

Trade-off 3: Caching vs. Freshness

Decision: Cache public event information but verify availability through the booking service.

Advantage: Improves speed and reduces database load.

Disadvantage: Some displayed information may be slightly outdated.

Reason: An outdated event description is tolerable; an incorrect seat allocation is not.

Conclusion

TicketHub uses scalable application servers, caching, a virtual waiting room, and a transactional relational database to support normal traffic and popular concert sales.

The central design principle is that seat availability must be enforced by the backend and database. This protects customers from double-booking while maintaining performance, correctness, and fairness during periods of heavy demand.