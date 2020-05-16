# session-service
Motum micro-service for handling real-time user activity sessions

Steps to get it up and running:
- Specify environment variables, such as:
  - `DATABASE_URL`: posrgress URL to a database in format: `postgresql://<username>:<password>@<hostname>:<port>/<database>?schema=<schema_name>` (for e.g. `postgresql://user:password@localhost:5432/motum?schema=public`)
  - `PORT`: port on which REST authentication api will be available
  - `BIND_ADDRESS`: address to bind REST api socket to
  - `AUTH_VERIFICATION_SERVICE_URL`: address for the gRPC authentication service
  - `USER_REGISTRY_SERVICE_URL`: address for the gRPC user-registry service
- `yarn build`
- `yarn start`

Or after you add env variables use `yarn docker` to build docker image
