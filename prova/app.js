import express from 'express';
import cors from 'cors';
import fs from 'node:fs/promises';
import { v4 as uuid } from 'uuid';

const PORT = 3333;
const url_database = './database/database.json';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// POST /motoristas
app.post('/motoristas', async (req, res) => {
  try {
    const { nome, data_nascimento, carteira_habilitacao, onibus_id } = req.body;

    if (!nome || !data_nascimento || !carteira_habilitacao) {
      return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    const data = await fs.readFile(url_database, 'utf-8');
    const db = JSON.parse(data);
    
    const novoMotorista = {
      id: uuid(),
      nome,
      data_nascimento,
      carteira_habilitacao
    };

    db.motoristas.push(novoMotorista);

    if (onibus_id) {
      const onibus = db.onibus.find(o => o.id === onibus_id);
      if (!onibus) {
        return res.status(404).json({ mensagem: 'Ônibus com o ID fornecido não encontrado.' });
      }
      onibus.motorista_id = novoMotorista.id;
    }

    await fs.writeFile(url_database, JSON.stringify(db, null, 2));
    res.status(201).json({ mensagem: 'Motorista criado e associado', motorista: novoMotorista });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao processar a requisição' });
  }
});

// POST /onibus
app.post('/onibus', async (req, res) => {
  try {
    const { placa, modelo, ano_fabricacao, capacidade } = req.body;

    if (!placa || !modelo || !ano_fabricacao || !capacidade) {
      return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    const data = await fs.readFile(url_database, 'utf-8');
    const db = JSON.parse(data);
    
    const novoOnibus = {
      id: uuid(),
      placa,
      modelo,
      ano_fabricacao,
      capacidade,
      motorista_id: null
    };

    db.onibus.push(novoOnibus);
    await fs.writeFile(url_database, JSON.stringify(db, null, 2));
    res.status(201).json(novoOnibus);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao criar ônibus' });
  }
});

// GET /motoristas
app.get('/motoristas', async (req, res) => {
  try {
    const data = await fs.readFile(url_database, 'utf-8');
    const db = JSON.parse(data);
    res.status(200).json(db.motoristas);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao carregar motoristas' });
  }
});

// GET /onibus
app.get('/onibus', async (req, res) => {
  try {
    const data = await fs.readFile(url_database, 'utf-8');
    const db = JSON.parse(data);
    res.status(200).json(db.onibus);
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao carregar ônibus' });
  }
});

// GET /onibus/motorista/:id
app.get('/onibus/motorista/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(url_database, 'utf-8');
    const db = JSON.parse(data);
    
    const onibus = db.onibus.find(o => o.id === id);
    if (!onibus) return res.status(404).json({ mensagem: 'Ônibus não encontrado' });

    const motorista = db.motoristas.find(m => m.id === onibus.motorista_id) || null;
    res.status(200).json({ ...onibus, motorista });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao buscar associação' });
  }
});

// PUT /motoristas/onibus/:id
app.put('/motoristas/onibus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { onibus_id } = req.body;

    const data = await fs.readFile(url_database, 'utf-8');
    const db = JSON.parse(data);
    
    const motorista = db.motoristas.find(m => m.id === id);
    const onibus = db.onibus.find(o => o.id === onibus_id);

    if (!motorista || !onibus) {
      return res.status(404).json({ mensagem: 'Motorista ou ônibus não encontrado' });
    }

    onibus.motorista_id = motorista.id;
    await fs.writeFile(url_database, JSON.stringify(db, null, 2));
    res.status(200).json({ ...motorista, onibus });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao atualizar associação' });
  }
});

// DELETE /onibus/motorista/:id
app.delete('/onibus/motorista/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fs.readFile(url_database, 'utf-8');
    const db = JSON.parse(data);
    
    const onibus = db.onibus.find(o => o.id === id);
    if (!onibus) return res.status(404).json({ mensagem: 'Ônibus não encontrado' });

    onibus.motorista_id = null;
    await fs.writeFile(url_database, JSON.stringify(db, null, 2));
    res.status(200).json({ ...onibus, motorista: null });
  } catch (error) {
    res.status(500).json({ mensagem: 'Erro ao remover associação' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor ligado em http://localhost:${PORT}`);
});