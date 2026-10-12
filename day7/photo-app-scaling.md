SnapShare: Photo-App Scaling Plan

1. Assumptions

- SnapShare has 10 million registered users.
- 10% of registered users are active each day.
- Each daily active user uploads one photo and views 50 feed pages per day.
- An original photo averages 2 MB, and each photo produces one 50 KB thumbnail.
- A day has 86,400 seconds and a year has 365 days.
- Storage calculations use decimal units: 1 MB = 1,000 KB, 1 GB = 1,000 MB and 1 TB = 1,000 GB.
- Traffic is distributed across the day for average calculations, with peak feed traffic assumed to be five times the average.
- Each feed view represents one page request; image downloads may generate additional requests.
- Storage estimates include one original and one thumbnail per uploaded photo but exclude backups, replicas and other overhead.

2. Traffic and Storage Estimates

Daily active users

Daily active users = 10,000,000 × 10% = 1,000,000 users.

Photo uploads per second

Daily uploads = 1,000,000 × 1 = 1,000,000 uploads/day.

Average uploads per second = 1,000,000 ÷ 86,400 = 11.57 uploads/second.

Feed views per second

Daily feed views = 1,000,000 × 50 = 50,000,000 feed views/day.

Average feed views per second = 50,000,000 ÷ 86,400 = 578.70, approximately 579 views/second.

Peak feed views per second = 578.70 × 5 = 2,893.52, approximately 2,894 views/second.

Annual photo storage

Original photos per day = 1,000,000 × 2 MB = 2,000,000 MB = 2 TB/day.

Annual original-photo storage = 2 TB × 365 = 730 TB/year.

Thumbnail storage per day = 1,000,000 × 50 KB = 50,000,000 KB = 50 GB/day.

Annual thumbnail storage = 50 GB × 365 = 18.25 TB/year.

Total annual storage added = 730 TB + 18.25 TB = 748.25 TB/year.

These estimates exclude backups, replication, temporary files, metadata and storage overhead.

3. Read-Heavy or Write-Heavy?

SnapShare is a read-heavy system because users generate 50 million feed page views per day but only 1 million photo uploads per day. The system has approximately 50 feed views for every upload. Therefore, the architecture should prioritize fast feed delivery using a CDN, caching and database read replicas, while keeping uploads reliable and thumbnail processing asynchronous.

4. Architecture Diagram

                     USERS / MOBILE APP
                            |
                            v
                          [CDN]
                  Cached photos/thumbnails
                            |
                            v
                     [LOAD BALANCER]
                            |
                            v
                       [APP SERVERS]
                       /     |      \
                      /      |       \
                 [CACHE] [PRIMARY DB] [OBJECT STORAGE]
                            |          Originals
                            v          + thumbnails
                      [READ REPLICA]        ^
                                            |
                     [QUEUE]                |
                        |                   |
                        v                   |
                     [WORKER] ---------------+
                 Creates thumbnails

Uploads can go directly from the user's device to object storage through a short-lived signed URL authorized by the backend.

5. Components and Their Responsibilities

- CDN: Delivers cached photos and thumbnails from locations near users, reducing late⁸ncy and origin traffic.
- Load balancer: Distributes incoming requests across healthy application servers.
- App servers: Handle authentication, permissions, upload authorization, feed logic and application requests.
- Cache: Stores frequently requested feed data and metadata to reduce repeated database queries.
- Primary database: Stores structured data such as users, follows, captions, permissions and photo metadata.
- Read replica: Serves eligible read queries to reduce load on the primary database.
- Object storage: Stores large photo files and thumbnails separately from structured database records.
- Queue: Holds thumbnail-generation jobs so uploads do not need to wait for image processing.
- Worker: Consumes queued jobs, generates thumbnails and saves them to object storage.

6. Photo Upload Flow

1. The user selects a photo and initiates an upload.
2. The app server authenticates the user, checks permissions and issues a short-lived signed upload URL.
3. The user's device uploads the original photo directly to object storage.
4. After the upload is verified, the backend records the photo metadata in the primary database.
5. The backend publishes a thumbnail-generation job to the queue.
6. A worker retrieves the original photo, generates a 50 KB thumbnail and stores it in object storage.
7. The app can retrieve the photo metadata and serve the original or thumbnail through the CDN as appropriate.

Thumbnail generation happens asynchronously, so the initial upload does not need to wait for the worker. The system should track processing status, retry failed jobs and monitor queue delays.

7. Trade-Offs

Caching vs. data freshness

Caching reduces latency and database load, but cached feed information can become stale after a photo is edited, deleted or a follow relationship changes. Cache invalidation or expiration policies are needed.

Read replicas vs. consistency

Read replicas increase read capacity, but replication lag may cause users to see outdated data briefly. Important reads that require immediate consistency can use the primary database.

Asynchronous processing vs. immediate availability

Queues keep uploads responsive and allow thumbnail workers to scale independently. However, queue backlogs or worker failures can delay thumbnails. Retries, monitoring and failed-job handling are necessary.

Object storage vs. database storage

Object storage is more appropriate for large image files and supports scalable delivery through a CDN. However, the application must manage file permissions, object keys, metadata consistency and cleanup when photos are deleted.

8. Conclusion

SnapShare should separate structured metadata from photo files, use a CDN and cache for frequent reads, distribute API requests across application servers, and use a primary database with a read replica. A queue and background workers allow thumbnail generation to scale independently. This architecture addresses the estimated 2,894 peak feed views per second and approximately 748.25 TB of new photo storage per year, while acknowledging that real production capacity requires load testing and monitoring.