document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const res = await fetch('https://your-backend.onrender.com/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    window.location.href = 'dashboard.html';
                } else {
                    alert(data.error);
                }
            } catch (err) {
                alert('Erro: ' + err.message);
            }
        });
        document.getElementById('registerBtn').addEventListener('click', async () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                const res = await fetch('https://your-backend.onrender.com/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, plano: 'free' })
                });
                const data = await res.json();
                if (res.ok) {
                    alert('Registrado! Faça login.');
                } else {
                    alert(data.error);
                }
            } catch (err) {
                alert('Erro: ' + err.message);
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
                const res = await fetch('https://your-backend.onrender.com/create-app', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ appName, repoUrl })
                });
                const data = await res.json();
                document.getElementById('result').innerHTML = res.ok
                    ? `<p>App criado: <a href="${data.url}">${data.url}</a></p>`
                    : `<p>Erro: ${data.error}</p>`;
            } catch (err) {
                document.getElementById('result').innerHTML = `<p>Erro: ${err.message}</p>`;
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
            const res = await fetch('https://your-backend.onrender.com/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ plano })
            });
            const data = await res.json();
            window.location.href = data.url;
        } catch (err) {
            alert('Erro: ' + err.message);
        }
    };
});
