const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const port = 3000;

// Middleware para ler formulários (POST)
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos (HTML, CSS, JS da pasta "public")
app.use(express.static(path.join(__dirname, "public")));

// Conexão com o banco de dados MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",       // seu usuário MySQL
    password: "8945",   // sua senha MySQL
    database: "telaloginsimples"
});

// Testar conexão
db.connect((err) => {
    if (err) {
        console.error("❌ Erro ao conectar ao banco de dados:", err);
    } else {
        console.log("✅ Conectado ao banco de dados MySQL!");
    }
});

// ---------------- ROTAS ----------------

// Página inicial → redireciona para login
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Página de login
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Página de cadastro
app.get("/cadastro", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "cadastro.html"));
});

// Página de sucesso após o cadastro
app.get("/sucessocadastro", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "sucessocadastro.html"));
});

// ---------------- ROTA DE LOGIN ----------------
app.post("/login", (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.redirect("/login?erro=Preencha todos os campos!");
    }

    const query = "SELECT * FROM usuarios WHERE usuario = ? AND senha = ?";
    db.query(query, [usuario, senha], (err, results) => {
        if (err) {
            console.error("Erro ao consultar banco:", err);
            return res.redirect("/login?erro=Erro interno no servidor.");
        }

        if (results.length > 0) {
            // Login OK
            res.send(`
                <h2>✅ Login bem-sucedido!</h2>
                <p>Bem-vindo, <strong>${usuario}</strong>!</p>
            `);
        } else {
            // Login inválido
            res.redirect("/login?erro=Usuário ou senha incorretos!");
        }
    });
});

// ---------------- ROTA DE CADASTRO ----------------
app.post("/cadastro", (req, res) => {
    const { usuario, senha, confirmarSenha } = req.body;

    if (!usuario || !senha || !confirmarSenha) {
        return res.send("❌ Preencha todos os campos!");
    }

    if (senha !== confirmarSenha) {
        return res.send(`
            <script>
                alert("⚠️ As senhas não coincidem!");
                window.location.href = "/cadastro";
            </script>
        `);
    }

    // Verifica se o usuário já existe
    const checkUser = "SELECT * FROM usuarios WHERE usuario = ?";
    db.query(checkUser, [usuario], (err, results) => {
        if (err) {
            console.error("Erro ao verificar usuário:", err);
            return res.status(500).send("Erro interno no servidor.");
        }

        if (results.length > 0) {
            return res.send(`
                <script>
                    alert("⚠️ Usuário já cadastrado!");
                    window.location.href = "/cadastro";
                </script>
            `);
        }

        // Se não existir, cria o novo usuário
        const insertUser = "INSERT INTO usuarios (usuario, senha) VALUES (?, ?)";
        db.query(insertUser, [usuario, senha], (err) => {
            if (err) {
                console.error("Erro ao cadastrar usuário:", err);
                return res.status(500).send("Erro ao salvar no banco de dados.");
            }

            // Redireciona para a página de sucesso
            res.redirect("/sucessocadastro");
        });
    });
});

// ---------------- INICIAR SERVIDOR ----------------
app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
