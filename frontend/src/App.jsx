import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const LANGUAGE_VERSIONS = {
  python: '3.12.0',
  java: '15.0.2'
};

const DEFAULT_CODE = {
  python: 'print("Hello World")',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}'
};

function App() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [hint, setHint] = useState('');
  const [loadingHint, setLoadingHint] = useState(false);
  const [review, setReview] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);
  const [question, setQuestion] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loadingExplain, setLoadingExplain] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/questions')
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(() => setQuestions([]));
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang]);
    setOutput('');
    setHint('');
    setReview('');
    setExplanation('');
  };

  const runCode = () => {
    setRunning(true);
    setOutput('Running...');
    fetch('http://localhost:8000/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, version: LANGUAGE_VERSIONS[language] })
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

  const getHint = () => {
    setLoadingHint(true);
    setHint('Thinking...');
    fetch('http://localhost:8000/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_title: selected.title,
        question_description: selected.description,
        code
      })
    })
      .then(res => res.json())
      .then(data => {
        setHint(data.hint);
        setLoadingHint(false);
      })
      .catch(() => {
        setHint('Could not get a hint right now.');
        setLoadingHint(false);
      });
  };

  const getReview = () => {
    setLoadingReview(true);
    setReview('Reviewing...');
    fetch('http://localhost:8000/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_title: selected.title,
        code
      })
    })
      .then(res => res.json())
      .then(data => {
        setReview(data.review);
        setLoadingReview(false);
      })
      .catch(() => {
        setReview('Could not get a review right now.');
        setLoadingReview(false);
      });
  };

  const askExplanation = () => {
    if (!question.trim()) return;
    setLoadingExplain(true);
    setExplanation('Thinking...');
    fetch('http://localhost:8000/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question_title: selected.title,
        code,
        user_question: question
      })
    })
      .then(res => res.json())
      .then(data => {
        setExplanation(data.explanation);
        setLoadingExplain(false);
      })
      .catch(() => {
        setExplanation('Could not get an answer right now.');
        setLoadingExplain(false);
      });
  };

  if (selected) {
    return (
      <div style={{ padding: '2rem', maxWidth: '900px' }}>
        <button onClick={() => setSelected(null)}>← Back to questions</button>
        <h2>{selected.title}</h2>
        <p>{selected.description}</p>
        <p><strong>Sample Input:</strong> {selected.sample_input}</p>
        <p><strong>Sample Output:</strong> {selected.sample_output}</p>

        <div style={{ marginBottom: '10px' }}>
          <label>Language: </label>
          <select value={language} onChange={(e) => changeLanguage(e.target.value)}>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        <Editor
          height="300px"
          language={language}
          value={code}
          onChange={(value) => setCode(value)}
          theme="vs-dark"
        />

        <div style={{ marginTop: '1rem' }}>
          <button onClick={runCode} disabled={running} style={{ padding: '8px 16px', marginRight: '10px' }}>
            {running ? 'Running...' : 'Run Code'}
          </button>
          <button onClick={getHint} disabled={loadingHint} style={{ padding: '8px 16px', marginRight: '10px' }}>
            {loadingHint ? 'Thinking...' : '💡 Get AI Hint'}
          </button>
          <button onClick={getReview} disabled={loadingReview} style={{ padding: '8px 16px' }}>
            {loadingReview ? 'Reviewing...' : '🔍 AI Code Review'}
          </button>
        </div>

        <h3>Output:</h3>
        <pre style={{ background: '#eee', padding: '1rem', minHeight: '50px' }}>{output}</pre>

        {hint && (
          <>
            <h3>💡 AI Hint:</h3>
            <div style={{ background: '#fff8dc', padding: '1rem', borderRadius: '6px', border: '1px solid #e0d090' }}>
              {hint}
            </div>
          </>
        )}

        {review && (
          <>
            <h3>🔍 AI Code Review:</h3>
            <div style={{ background: '#e8f0fe', padding: '1rem', borderRadius: '6px', border: '1px solid #a8c0f0' }}>
              {review}
            </div>
          </>
        )}

        <h3>❓ Ask AI about your code:</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Why is this O(n)? What edge case am I missing?"
            style={{ flex: 1, padding: '8px' }}
          />
          <button onClick={askExplanation} disabled={loadingExplain} style={{ padding: '8px 16px' }}>
            {loadingExplain ? 'Asking...' : 'Ask'}
          </button>
        </div>
        {explanation && (
          <div style={{ background: '#f0e8fe', padding: '1rem', borderRadius: '6px', border: '1px solid #c0a8f0' }}>
            {explanation}
          </div>
        )}
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