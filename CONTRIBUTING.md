
# Production

```sh
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up
```

# Development

```sh
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up
pnpm run start:dev
psql -h localhost -p 5432 -U username -d band_names
```
