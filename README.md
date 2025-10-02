# Проект «Алабуга» (Хакатон)

## Запуск проекта

### 1. Через Node.js

Перед первым запуском необходимо установить зависимости:

```bash
npm install
```

После установки можно запустить проект в режиме разработки:

```bash
npm run build
npm run preview
```

> ⚠️ Требуется Node.js версии ~20.19.2. Нужно дождаться завершения сборки.

### 2. Через Docker Compose

Если у вас установлен **docker-compose**, проект можно запустить одной командой:

```bash
docker-compose up -d
```

> ⚠️ При первом запуске потребуется время на сборку контейнеров.

### 3. Через Docker контейнер

Можно использовать уже собранный образ:

```bash
docker run -p 8080:80 --rm danilo9/alabuga-tech:latest
```

После этого проект будет доступен по адресу [http://localhost:8080](http://localhost:8080).

## Превью проекта

Актуальная версия уже задеплоена и доступна по адресу: [https://alabuga.kdser.site/](https://alabuga.kdser.site/)

## Тех стек
- React 18
- TypeScript 5
- Vite 6 (bundler & dev server)
- Tailwind CSS 3
- Zustand (state management)
- Radix UI + custom components
- Vitest + Testing Library (testing setup)
