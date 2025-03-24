# КупиПодариДай — Бэкенд сервиса

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-262627?style=for-the-badge&logo=typeorm&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

## Описание проекта

Бэкенд сервиса "КупиПодариДай" — это API для управления подарками и вишлистами, построенное на NestJS с использованием TypeORM и PostgreSQL.

## 🚀 Быстрый старт

### Предварительные требования

- Node.js v18+
- PostgreSQL 14+
- npm 9+

### Установка

```bash
# Клонирование репозитория
git clone https://github.com/code-imm/kupipodariday-backend.git
cd backend

# Установка зависимостей
npm install

# Настройка окружения (скопируйте и отредактируйте .env)
cp .env.example .env
```

### Конфигурация

Отредактируйте `.env` файл:

```ini
PORT=3000
DATABASE_URL=postgres://student:student@localhost:5432/kupipodariday
DATABASE_PORT=5432
JWT_SECRET=jwt_secret
```

### Запуск

```bash
# Разработка
npm run start:dev

# Продакшен сборка
npm run build
npm run start:prod
```

## 🛠 Команды

| Команда            | Описание                          |
|--------------------|-----------------------------------|
| `npm start`        | Запуск в production режиме        |
| `npm run start:dev`| Запуск в development режиме       |
| `npm run build`    | Сборка проекта                    |
| `npm run lint`     | Проверка стиля кода               |
| `npm run format`   | Форматирование кода               |
| `npm test`         | Запуск тестов                     |

## 📦 Зависимости

### Основные
- **NestJS** — фреймворк для Node.js
- **TypeORM** — ORM для работы с БД
- **PostgreSQL** — реляционная база данных
- **JWT** — аутентификация

### Разработка
- **ESLint** — линтер
- **Prettier** — форматирование кода

## ✉️ Контакты

**Разработчик**: Даниил Колесников  
**Email**: [codeimm@yandex.ru](mailto:codeimm@yandex.ru)