import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import { v4 as uuid } from 'uuid';

const PORT = 3333;
const url_database = './database/database.json';

const app = express();

app.use(cors({
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

// POST /motoristas
app.post('/motoristas', (req, res) => {

    const { nome, data_nascimento, carteira_habilitacao, onibus_id } = req.body;

    if(!nome || !data_nascimento || !carteira_habilitacao) {
        return res.status(400).json({ mensagem: "Todos os campos obrigatórios devem ser preenchido" })
    }

    fs.readFile(url_database, 'utf-8', (err, data) => {

        if(err) return res.status(500).json({ mensagem: "Erro ao ler banco de dados" });

        const db = JSON.parse(data);

        const novoMotorista = {
            id: uuid(),
            nome,
            data_nascimento,
            carteira_habilitacao
        }

        db.motoristas.push(novoMotorista);

        if(onibus_id) {
            const onibus = db.onibus.find(o => o.id === onibus_id);

            if(!onibus) {
                res.status(404).json({ mensagem: "Ônibus com o ID fornecido não encontrado." })
            }
        }

        fs.writeFile(url_database, JSON.stringify(db, null, 2), (err) => {
            if(err) return res.status(500).json({ mensagem: "Erro ao salvar dados" });
            res.status(201).json({ mensagem: "Motorista criado e Associado", motorista: novoMotorista})
        })

    })
})

// POST /onibus
app.post('/onibus', (req, res) => {
    const { placa, modelo, ano_fabricacao, capacidade } = req.body;

    if(!placa || !modelo || !ano_fabricacao || !capacidade) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios." })
    }

    fs.readFile(url_database, 'utf-8', (err, data) => {
        if(err) return res.status(500).json({ mensagem: "Erro ao ler banco de dados." });

        const db = JSON.parse(data);

        const novoOnibus = {
            id: uuid(),
            placa,
            modelo,
            ano_fabricacao,
            capacidade,
            motorista_id: null
        }

        db.onibus.push(novoOnibus)

        fs.writeFile(url_database, JSON.stringify(db, null, 2), (err) => {
            if(err) return res.status(500).json({ mensagem: "Erro ao salvar ônibus" });
            res.status(201).json(novoOnibus)
        })

    })

})

app.listen(PORT, () => {
    console.log(`Servidor Ligado http://localhost:${PORT}`)
})
