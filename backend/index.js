const express = require('express');
const cors = require('cors');
const neo4j = require('neo4j-driver');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const session = driver.session();

// Add Node
app.post('/api/add-node', async (req, res) => {
  const { name } = req.body;
  try {
    await session.run('CREATE (n:Person {name: $name}) RETURN n', { name });
    res.status(201).send('Node added');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Delete Node
app.post('/api/delete-node', async (req, res) => {
  const { name } = req.body;
  try {
    await session.run('MATCH (n:Person {name: $name}) DETACH DELETE n', { name });
    res.status(200).send('Node deleted');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get All Nodes
app.get('/api/nodes', async (req, res) => {
  try {
    const result = await session.run('MATCH (n:Person) RETURN n.name AS name');
    const names = result.records.map(record => record.get('name'));
    res.json(names);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add Relationship
app.post('/api/add-relationship', async (req, res) => {
  const { from, to, type } = req.body;
  try {
    const result = await session.run(
      `
      MATCH (a:Person {name: $from}), (b:Person {name: $to})
      MERGE (a)-[r:${type.toUpperCase()}]->(b)
      RETURN type(r)
      `,
      { from, to }
    );

    if (result.records.length > 0) {
      res.status(201).json({ message: `Relationship '${type}' added from ${from} to ${to}` });
    } else {
      res.status(400).json({ error: 'Could not create relationship' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));