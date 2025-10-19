[![Deploy](https://github.com/kalininDanil17Y/alabuga-hackathon/actions/workflows/deploy.yml/badge.svg)](https://github.com/kalininDanil17Y/alabuga-hackathon/actions/workflows/deploy.yml)

# Проект «Алабуга» (Хакатон)

## Запуск проекта

### Node.js (локально)

```bash
npm install
npm run dev
```

Приложение будет доступно на [http://localhost:5173](http://localhost:5173), API ожидает запросы на [http://localhost:3001](http://localhost:3001). Для запуска API в Node.js режиме используйте `npm run server:dev` (горячая перезагрузка) или `npm run server:start` (однократный запуск).

### Docker Compose

#### Продовый стенд (Traefik)

`docker-compose.yml` ориентирован на деплой за внешним Traefik и использует заранее собранные образы из реестра. Перед запуском:

- убедитесь, что создана внешняя сеть Traefik: `docker network create proxy`
- создайте `.env.deploy` с переменными:
  - `STACK` уникальный префикс для сервисов Traefik (например, `alabuga`)
  - `DOMAIN` доменное имя, по которому будет доступен стенд (например, `alabuga.example.ru`)
  - при необходимости переопределите `TAG`, `REGISTRY`, `REGISTRY_NAMESPACE`

Запуск:

```bash
docker compose --env-file .env.deploy up -d
```

Traefik будет проксировать трафик к сервисам `web` и `api`, развёрнутым во внешней сети `proxy`.

#### Локальный docker-compose

Для проверки проекта целиком без Traefik используйте `docker-compose.local.yml`, который собирает контейнеры из текущего репозитория и проксирует API через Nginx.

```bash
docker compose -f docker-compose.local.yml up -d --build
```

После сборки фронт доступен на [http://localhost:8080](http://localhost:8080), API на [http://localhost:3001](http://localhost:3001) или через прокси по адресу `http://localhost:8080/api/*`. Чтобы остановить стенд, выполните `docker compose -f docker-compose.local.yml down`.

### Docker run (без docker-compose)

Если требуется поднять контейнеры вручную, создайте общую сеть и запустите два процесса: API и фронт.

```bash
docker build -f docker/api.Dockerfile -t alabuga-api .
docker build -t alabuga-web .

docker network create alabuga-net

docker run -d --name alabuga-api --network alabuga-net --network-alias api -p 3001:3001 alabuga-api

docker run -d --name alabuga-web --network alabuga-net -p 8080:80 alabuga-web
```

Фронт будет доступен на [http://localhost:8080](http://localhost:8080), а API напрямую на [http://localhost:3001](http://localhost:3001). Остановить контейнеры можно командами `docker stop alabuga-web alabuga-api` и `docker rm alabuga-web alabuga-api`. Сеть удаляется командой `docker network rm alabuga-net`.

## Превью проекта
Актуальная версия уже задеплоена и доступна по адресу: [https://nvote.ru/](https://nvote.ru/)

## Тех стек
- React 18
- TypeScript 5
- Vite 6 (bundler & dev server)
- Tailwind CSS 3
- Zustand (state management)
- Radix UI + custom components
- Vitest + Testing Library (testing setup)
