# FitTrace v2 (Self-Hosted Stack)

Напълно самостоятелен проект (може да се отдели като отделно Git repo или да замени изцяло v1), изграден със стек:
- **Бекенд:** ASP.NET Core 9 Web API + Entity Framework Core (PostgreSQL)
- **База данни:** PostgreSQL 16
- **Външен достъп:** Cloudflare Tunnel (`cloudflared`) за сигурна връзка без отваряне на портове в домашния рутер
- **Клиент:** React 19 PWA с модулен REST API клиент
- **Тестове:** xUnit (за бекенда) и Vitest (за фронтенда)

---

## Структура на проекта

```text
v2/
├── README.md               <-- Това ръководство
├── .gitignore              <-- Игнорирани файлове за .NET и Node
├── docker-compose.yml      <-- Инфраструктура за домашен сървър (Postgres + API + Cloudflare)
│
├── docs/                   <-- Индексна документация
│   ├── architecture-decisions.md <-- Архитектурни решения (ADR)
│   ├── api-index.md              <-- Карта на REST API ендпоинтите
│   └── database-index.md         <-- Карта на релационните таблици и връзки
│
├── backend/                <-- .NET 9 решение
│   ├── FitTrace.sln
│   ├── src/
│   │   ├── FitTrace.Core/  <-- Домейн модели, DTOs, изчисления (1RM, обем)
│   │   ├── FitTrace.Data/  <-- EF Core DbContext, PostgreSQL конфигурации, услуги
│   │   └── FitTrace.Api/   <-- Web API контролери, CORS, Dockerfile
│   └── tests/
│       └── FitTrace.Tests/ <-- Автоматизирани xUnit тестове за бизнес логиката
│
└── client/                 <-- Самостоятелен PWA клиент
    ├── package.json
    ├── src/
    │   ├── services/apiClient.ts <-- Клиент за комуникация с бекенда
    │   └── utils/calculations.ts <-- Синхронизирани фронтенд калкулации
    └── tests/
        └── calculations.test.ts  <-- Vitest тестове за фронтенда
```

---

## Стартиране на домашния сървър (Production)

1. Уверете се, че имате инсталирани Docker и Docker Compose.
2. Копирайте директорията `v2/` на домашния сървър (или клонирайте новото repo, ако е отделено).
3. Създайте `.env` файл с вашите тайни:
   ```env
   POSTGRES_PASSWORD=вашата_парола
   CLOUDFLARE_TUNNEL_TOKEN=вашият_cloudflare_tunnel_token
   JWT_SECRET=дълъг_и_сигурен_ключ_за_jwt_токени
   ```
4. Стартирайте контейнерите:
   ```bash
   docker compose up -d
   ```

---

## Локална разработка и тестване

### 1. Стартиране на автоматизираните .NET тестове
```bash
cd backend
dotnet test FitTrace.sln
```

### 2. Стартиране на API локално
```bash
cd backend/src/FitTrace.Api
dotnet run
```
API-то ще стартира на `http://localhost:5000` (здравен статус: `http://localhost:5000/health`).

### 3. Стартиране на тестовете за фронтенда
```bash
npm run test
```

---

## Отделяне в самостоятелно Git Repository

Ако желаете да отделите `v2` в отделно хранилище в GitHub/GitLab:
```bash
# 1. Отидете в папката v2
cd v2

# 2. Инициализирайте ново git repo
git init
git add .
git commit -m "feat: initial commit for FitTrace v2 standalone repo"

# 3. Свържете с новото отдалечено хранилище
git remote add origin git@github.com:вашият-потребител/fittrace-v2.git
git branch -M main
git push -u origin main
```
