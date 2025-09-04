# Obscure Hosting

Plataforma de hospedagem gratuita para apps, com planos:
- Gratuito: 5 apps, 512MB RAM, 1GB storage.
- Básico: 10 apps, R$20/mês.
- Pro: 20 apps, R$40/mês.

## Configuração

### Frontend
1. Hospedado no GitHub Pages: `https://seu-usuario.github.io/obscure-hosting`.
2. Ative GitHub Pages em Settings > Pages (branch: main, pasta: /).
3. Arquivos: `index.html`, `planos.html`, `dashboard.html`, `success.html`, `cancel.html`, `styles.css`, `script.js`.

### Backend
1. Hospede no Render como **Web Service** (free tier):
   - Crie conta em render.com.
   - Crie Web Service (Node.js), conecte ao repositório `obscure-hosting`, pasta `backend/`.
   - Defina comando de start: `node server.js`.
   - Configure variáveis de ambiente:
     - `STRIPE_SECRET_KEY`: Chave do Stripe (stripe.com).
     - `STRIPE_WEBHOOK_SECRET`: Webhook secret do Stripe.
     - `JWT_SECRET`: String segura (ex.: `minha-chave-secreta-123`).
     - `DATABASE_URL`: Fornecido pelo PostgreSQL grátis do Render.
   - Adicione banco PostgreSQL gratuito no Render.
2. Crie tabelas no PostgreSQL:
   ```sql
   CREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR, password VARCHAR, plano VARCHAR, max_apps INT);
   CREATE TABLE apps (id SERIAL PRIMARY KEY, user_id INT, nome VARCHAR, repo_url VARCHAR);
