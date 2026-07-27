import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

function App() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState('print("Hello World")');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/questions')
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(() => setQuestions([]));
  }, []);

  const runCode = () => {
    setRunning(true);
    setOutput('Running...');
    fetch('http://localhost:8000/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language: 'python' })
    })
      .then(res => res.json())
      .then(data => {
        setOutput(data.output || data.stderr || 'No output');
        setRunning(false);
      })
      .catch(() => {
        setOutput('Error running code');
        setRunning(false);
      });
  };

  if (selected) {
    return (
      <div style={{ padding: '2rem' }}>
        <button onClick={() => setSelected(null)}>← Back to questions</button>
        <h2>{selected.title}</h2>
        <p>{selected.description}</p>
        <p><strong>Sample Input:</strong> {selected.sample_input}</p>
        <p><strong>Sample Output:</strong> {selected.sample_output}</p>

        <Editor
          height="300px"
          defaultLanguage="python"
          value={code}
          onChange={(value) => setCode(value)}
          theme="vs-dark"
        />

        <button onClick={runCode} disabled={running} style={{ marginTop: '1rem', padding: '8px 16px' }}>
          {running ? 'Running...' : 'Run Code'}
        </button>

        <h3>Output:</h3>
        <pre style={{ background: '#eee', padding: '1rem', minHeight: '50px' }}>{output}</pre>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>AI Coding Platform</h1>
      <h2>Questions</h2>
      <ul>
        {questions.map(q => (
          <li key={q.id} style={{ cursor: 'pointer', marginBottom: '8px' }}>
            <span onClick={() => setSelected(q)}>
              <strong>{q.title}</strong> — {q.difficulty}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;