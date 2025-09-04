const express = require('express');
const { Pool } = require('pg');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); // Permite todas as origens para testes; ajuste para produção

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Middleware de autenticação
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET || 'sua-chave-secreta');
        next();
    } catch (e) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// Rota de registro
app.post('/register', async (req, res) => {
    const { email, password, plano } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const maxApps = plano === 'free' ? 5 : plano === 'basico' ? 10 : 20;
    try {
        const result = await pool.query(
            'INSERT INTO users (email, password, plano, max_apps) VALUES ($1, $2, $3, $4) RETURNING id',
            [email, hashed, plano, maxApps]
        );
        res.json({ userId: result.rows[0].id });
    } catch (err) {
        res.status(400).json({ error: 'Email já existe' });
    }
});

// Rota de login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length && await bcrypt.compare(password, result.rows[0].password)) {
        const token = jwt.sign({ id: result.rows[0].id, plano: result.rows[0].plano }, process.env.JWT_SECRET || 'sua-chave-secreta');
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Credenciais inválidas' });
    }
});

// Rota para criar app
app.post('/create-app', authenticate, async (req, res) => {
    const { appName, repoUrl } = req.body;
    const userApps = await pool.query('SELECT COUNT(*) FROM apps WHERE user_id = $1', [req.user.id]);
    const maxApps = req.user.plano === 'free' ? 5 : req.user.plano === 'basico' ? 10 : 20;
    if (userApps.rows[0].count >= maxApps) {
        return res.status(403).json({ error: 'Limite de apps excedido. Faça upgrade.' });
    }

    try {
        await pool.query('INSERT INTO apps (user_id, nome, repo_url) VALUES ($1, $2, $3)', [req.user.id, appName, repoUrl]);
        res.json({ url: `https://mock-${appName}-${req.user.id}.onrender.com` });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao criar app' });
    }
});

// Rota para checkout Stripe
app.post('/create-checkout-session', authenticate, async (req, res) => {
    const { plano } = req.body;
    const price = plano === 'basico' ? 2000 : 4000;
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price_data: { currency: 'brl', product_data: { name: plano }, unit_amount: price }, quantity: 1 }],
            mode: 'subscription',
            success_url: 'https://your-frontend.onrender.com/success.html', // Ajuste para o URL do frontend
            cancel_url: 'https://your-frontend.onrender.com/cancel.html', // Ajuste para o URL do frontend
            metadata: { userId: req.user.id, plano }
        });
        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao criar sessão de pagamento' });
    }
});

// Webhook Stripe
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { userId, plano } = session.metadata;
            const maxApps = plano === 'basico' ? 10 : 20;
            await pool.query('UPDATE users SET plano = $1, max_apps = $2 WHERE id = $3', [plano, maxApps, userId]);
        }
        res.json({ received: true });
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Backend rodando na porta ${port}`));
