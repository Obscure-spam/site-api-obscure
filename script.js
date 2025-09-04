document.addEventListener('DOMContentLoaded', () => {
    const backendUrl = 'https://site-api-obscure-z68c.onrender.com'; // Novo URL do Web Service

    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const res = await fetch(`${backendUrl}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Request failed with status ${res.status}: ${text.slice(0, 100)}`);
                }
                const data = await res.json();
                localStorage.setItem('token', data.token);
                window.location.href = 'dashboard.html';
            } catch (err) {
                alert(`Erro ao fazer login: ${err.message}. Verifique se o backend está rodando em ${backendUrl}.`);
            }
        });
        document.getElementById('registerBtn').addEventListener('click', async () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const res = await fetch(`${backendUrl}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, plano: 'free' })
                });
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Request failed with status ${res.status}: ${text.slice(0, 100)}`);
                }
                const data = await res.json();
                alert('Registrado! Faça login.');
            } catch (err) {
                alert(`Erro ao registrar: ${err.message}. Verifique se o backend está rodando em ${backendUrl}.`);
            }
        });
    }

    const appForm = document.getElementById('appForm');
    if (appForm) {
        appForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const appName = document.getElementById('appName').value;
            const repoUrl = document.getElementById('repoUrl').value;
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${backendUrl}/create-app`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ appName, repoUrl })
                });
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Request failed with status ${res.status}: ${text.slice(0, 100)}`);
                }
                const data = await res.json();
                document.getElementById('result').innerHTML = `<p>App criado: <a href="${data.url}">${data.url}</a></p>`;
            } catch (err) {
                document.getElementById('result').innerHTML = `<p>Erro: ${err.message}. Verifique se o backend está rodando em ${backendUrl}.</p>`;
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }

    window.upgrade = async (plano) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${backendUrl}/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ plano })
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Request failed with status ${res.status}: ${text.slice(0, 100)}`);
            }
            const data = await res.json();
            window.location.href = data.url;
        } catch (err) {
            alert(`Erro ao fazer upgrade: ${err.message}. Verifique se o backend está rodando em ${backendUrl}.`);
        }
    };
});
