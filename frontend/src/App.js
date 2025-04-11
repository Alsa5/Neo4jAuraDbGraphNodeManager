import { useEffect, useState } from 'react';
import './App.css';
function App() {
  const [name, setName] = useState('');
  const [nodes, setNodes] = useState([]);

  // Relationship inputs
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [relationship, setRelationship] = useState('');

  const fetchNodes = () => {
    fetch('http://localhost:5000/api/nodes')
      .then(res => res.json())
      .then(data => setNodes(data));
  };

  const handleAdd = () => {
    fetch('http://localhost:5000/api/add-node', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }).then(() => {
      setName('');
      fetchNodes();
    });
  };

  const handleDelete = (nodeName) => {
    fetch('http://localhost:5000/api/delete-node', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nodeName }),
    }).then(fetchNodes);
  };

  const handleAddRelationship = () => {
    if (!from || !to || !relationship) {
      alert('Please fill all relationship fields');
      return;
    }

    fetch('http://localhost:5000/api/add-relationship', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, type: relationship }),
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || data.error);
        setFrom('');
        setTo('');
        setRelationship('');
      });
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  return (
    <div className="container">
      <h2>Neo4j Node Manager</h2>

      <input
        placeholder="Enter node name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleAdd}>Add Node</button>

      <ul>
        {nodes.map((n, idx) => (
          <li key={idx}>
            {n}
            <button onClick={() => handleDelete(n)} style={{ marginLeft: '1rem' }}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <h3 style={{ marginTop: '2rem' }}>Create Relationship</h3>

      <input
        placeholder="From"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
      />
      <input
        placeholder="To"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <input
        placeholder="Relationship Type (e.g., FRIEND)"
        value={relationship}
        onChange={(e) => setRelationship(e.target.value)}
      />
      <button onClick={handleAddRelationship}>Add Relationship</button>
    </div>
  );
}

export default App;
