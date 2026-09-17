# Operating the studio

Production: https://shivam-web-app.web.app

Hosting site: `shivam-web-app`. Cloud Run: `shivam-portfolio-ai`, `us-central1`. Google Cloud project: `gen-lang-client-0444960702`. Firestore database: `shivam-portfolio`. These names are deployment identifiers, not credentials.

## Static site updates

After tests and content review:

```sh
npm ci
npm test
npm run build
npm run test:e2e
npx firebase-tools@15.30.1 deploy --only hosting --project gen-lang-client-0444960702 --non-interactive
```

The checked-in Hosting configuration targets only this site. Do not replace it with a default project-wide configuration. Hosting pins the Cloud Run revision at deployment time; redeploy Hosting after a backend revision change to update its pinned target.

## Backend updates

The service uses Google Application Default Credentials through its dedicated runtime identity. Never create or check in a JSON service-account key. Build a uniquely tagged image, then deploy it to this service:

```sh
gcloud builds submit --project gen-lang-client-0444960702 --tag us-central1-docker.pkg.dev/gen-lang-client-0444960702/shivam-portfolio/guide:YOUR_RELEASE_TAG .
gcloud run deploy shivam-portfolio-ai --project gen-lang-client-0444960702 --region us-central1 --image us-central1-docker.pkg.dev/gen-lang-client-0444960702/shivam-portfolio/guide:YOUR_RELEASE_TAG
```

The existing configuration has one maximum instance, zero minimum instances, five active requests per process, and a 28-second application deadline covering body parsing, budget reservation, authentication and generation. Preserve the runtime service account and environment. Do not use `LOCAL_DEV=true` in production. A static-only release does not require a container build.

When changing knowledge, run `node scripts/prepare-knowledge.mjs`, review the complete generated corpus, test, then rebuild the backend image. Public project notes and selected resume facts are the only knowledge sources; do not add private repository contents, personal phone numbers, or credentials.

## Budget and privacy

The named Firestore database allows at most 400 reserved requests per UTC day globally and 35 per anonymous session, transactionally. This is a request limit, not an exact dollar limit. Anonymous sessions can be reset by a visitor; the global daily limit is the shared guard. Requests that fail after reservation still count. Per-process limits add 20 requests per minute globally and eight per minute per session.

The database stores counters, expiration times and hashed session identifiers. Application code does not save chat text. Google processes model messages and cloud infrastructure retains ordinary service/request logs. Cancellation prevents later generation when it happens before model dispatch; an already-dispatched model request may still incur provider usage.

Both counter collection groups have active `expiresAt` TTL policies. Firestore TTL is asynchronous, so 48 hours is an eligibility time, not a guaranteed deletion time. Client Firestore rules deny all access; the runtime account has database access scoped to this named database and Vertex AI access.

## Smoke check and rollback

After publication, open the public URL and verify navigation, one case study, the local lab and one real AI answer with its source link. `/api/health` reports service health; it does not prove provider availability. Review Cloud Run logs if the guide reports an error. The UI offers clearly labeled project-note search when the model is unavailable.

For a static rollback, select the prior release for this exact site in Firebase Hosting release history, or rebuild and redeploy a known-good Git commit. For a backend rollback, route this service to a known-good existing revision, then redeploy Hosting to refresh the pinned target. Inspect the revision and site before acting. No automatic production deploy is wired to GitHub.
