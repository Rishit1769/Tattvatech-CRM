# MinIO configuration

The private MinIO service is configured through deployment environment variables. The current private deployment exposes an API on port `9000` and a console on port `9001`:

- API: `http://<private-minio-host>:9000`
- Console: `http://<private-minio-host>:9001`
- Bucket: `tattvatech-private`
- TLS: not enabled yet; keep this service private until TLS/domain exposure is configured.

The application reads `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL`, `MINIO_BUCKET`, and either `MINIO_ACCESS_KEY`/`MINIO_SECRET_KEY` or MinIO's standard `MINIO_ROOT_USER`/`MINIO_ROOT_PASSWORD`. Credentials are intentionally not committed. Copy the credentials from the server's protected `/home/tattvatech/minio/.env` into the deployment environment.

Invoice PDFs and final quotation PDFs use private object keys. Transaction supporting documents use:

```text
transactions/{year}/{month}/{transaction-number}/{filename}
```

Quotations use:

```text
quotations/{year}/{client-id}/{quotation-number}/{filename}.pdf
```

MySQL stores only file metadata and the generated file ID. Retrieval uses an authenticated five-minute presigned URL; permanent public object URLs are not exposed.
