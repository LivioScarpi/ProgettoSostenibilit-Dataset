const { Client } = require('pg');
const express = require('express');
const cors = require('cors'); // Importa il pacchetto cors

const app = express();
const port = 3001;

// Configurazione del client PostgreSQL
const client = new Client({
    user: 'livio',
    host: 'localhost',

    //database: 'WorldAroundYou',

    database: 'postgres',
    password: 'Stratocaster99',
    port: 5432,
});

// Connessione al database
client.connect()
    .then(() => {
        console.log('Connesso al database PostgreSQL');
    })
    .catch(err => {
        console.error('Errore nella connessione al database:', err);
    });

const corsOptions = {
    origin: 'http://localhost:8080', // Includi il tuo frontend URL qui
};

app.use(cors(corsOptions));
app.use(express.json()); // Middleware per analizzare il corpo JSON

// Esempio di endpoint per eseguire una query
app.get('/tutti-luoghi', (req, res) => {
    const query = 'SELECT id, place_name as value, region, lat, lon, tags FROM places;';
    client.query(query, (err, result) => {
        if (err) {
            console.error('Errore nell\'esecuzione della query:', err);
            res.status(500).json({ error: 'Errore nell\'esecuzione della query' });
        } else {
            res.json(result.rows);
        }
    });
});

app.post('/luoghi-nei-dintorni', (req, res) => {
    const jsonBody = req.body;
    console.log("jsonBody");
    console.log(jsonBody);

    const query = `SELECT *
                            FROM places
                            WHERE ST_DISTANCE(
                                coordinates,
                                ST_MakePoint(${jsonBody.lon}, ${jsonBody.lat})::geography
                            ) <= 100000;`;

    console.log("QUERY");
    console.log(query);

    client.query(query, (err, result) => {
        if (err) {
            console.error('Errore nell\'esecuzione della query:', err);
            res.status(500).json({ error: 'Errore nell\'esecuzione della query' });
        } else {
            res.json(result.rows);
        }
    });
});

// Chiudere la connessione al database quando il server si spegne
app.on('exit', () => {
    client.end();
    console.log('Connessione al database chiusa');
});

app.listen(port, () => {
    console.log(`Il server è in ascolto sulla porta ${port}`);
});
