import express from 'express';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import fs from 'node:fs/promises';

const PORT = 3333;
const DATABASE_URL = './database/exercicio1.json';

const app = express();

app.use(cors({
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

// ROTAS PARA PRODUTOS

// POST /products - Criar novo 
app.post('/products', async (req, res) => {
    try {
        const { name, price, category } = req.body;

        if(!name || !price || !category) {
            return res.status(400).json({ error: "Name, price and category are required" })
        }

        const data = await fs.readFile(DATABASE_URL, 'utf-8');
        const db = await JSON.parse(data);

        const newProduct = {
            id: uuid(),
            name,
            price,
            category
        }

        db.products.push(newProduct);
        await fs.writeFile(DATABASE_URL, JSON.stringify(db, null, 2));

        res.status(201).json(newProduct)

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /products - Listar todos produtos
app.get('/products', async (req, res) => {
    try {
        const data = await fs.readFile(DATABASE_URL, 'utf-8');
        const db = await JSON.parse(data);

        res.json(db.products);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /products/:id - Obter produto específico
app.get('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fs.readFile(DATABASE_URL, 'utf-8');
        const db = await JSON.parse(data);

        const product = db.products.find(p => p.id === id);

        if(!product) return res.status(404).json({ error: "Product not found" });

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /products/:id - Remover produto
app.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fs.readFile(DATABASE_URL, 'utf-8');
        const db = JSON.parse(data);

        const productIndex = db.products.findIndex(p => p.id === id);

        if(productIndex === -1) return res.status(404).json({ error: "Product not found" });

        db.products.splice(productIndex, 1);

        await fs.writeFile(DATABASE_URL, JSON.stringify(db, null, 2));

        res.json({ message: 'Product deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


// ROTAS PARA CATEGORIAS

// POST /categories - Criar nova categoria
app.post('/categories', async (req, res) => {
    try {
        const { name } = req.body;

        if(!name) {
            return res.status(400).json({ error: "Name is required" })
        }

        const data = await fs.readFile(DATABASE_URL, 'utf-8');
        const db = await JSON.parse(data);

        const newCategory = {
            id: uuid(),
            name
        };

        db.categories.push(newCategory);
        await fs.writeFile(DATABASE_URL, JSON.stringify(db, null, 2));

        res.status(201).json(newCategory)

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /categories - Listar todas categorias
app.get('/categories', async (req, res) => {
    try {
        const data = await fs.readFile(DATABASE_URL, 'utf-8');
        const db = await JSON.parse(data);

        res.json(db.categories)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.listen(PORT, () => {
    console.log(`Servidor Ligado http://localhost:${PORT}`)
})