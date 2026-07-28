import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import './App.css';

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
      body: JSON.stringify({ question_title: selected.title, code })
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
      body: JSON.stringify({ question_title: selected.title, code, user_question: question })
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

  const Header = () => (
    <div className="app-header">
      <div className="logo">AI Coding<span className="accent-dot">.</span>Platform</div>
      <div className="header-badge">v1.0 · self-hosted execution</div>
    </div>
  );

  if (selected) {
    return (
      <div>
        <Header />
        <div className="page">
          <button className="back-btn" onClick={() => setSelected(null)}>← back to problems</button>

          <div className="detail-grid">
            <div className="desc-card">
              <div className="question-title-large">{selected.title}</div>
              <span className={`difficulty-badge difficulty-${selected.difficulty}`}>{selected.difficulty}</span>
              <p className="desc-text" style={{ marginTop: '16px' }}>{selected.description}</p>
              <div className="meta-row">Input: <span className="val">{selected.sample_input}</span></div>
              <div className="meta-row">Output: <span className="val">{selected.sample_output}</span></div>
            </div>

            <div>
              <div className="editor-panel">
                <div className="editor-toolbar">
                  <div className="window-chrome" style={{ padding: 0, background: 'none', border: 'none' }}>
                    <span className="dot dot-red"></span>
                    <span className="dot dot-yellow"></span>
                    <span className="dot dot-green"></span>
                  </div>
                  <select className="lang-select" value={language} onChange={(e) => changeLanguage(e.target.value)}>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                  </select>
                </div>
                <Editor
                  height="320px"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value)}
                  theme="vs-dark"
                />
              </div>

              <div className="action-bar">
                <button className="btn btn-primary" onClick={runCode} disabled={running}>
                  {running ? 'Running...' : '▶ Run Code'}
                </button>
                <button className="btn btn-secondary" onClick={getHint} disabled={loadingHint}>
                  {loadingHint ? 'Thinking...' : '💡 Get AI Hint'}
                </button>
                <button className="btn btn-secondary" onClick={getReview} disabled={loadingReview}>
                  {loadingReview ? 'Reviewing...' : '🔍 AI Code Review'}
                </button>
              </div>

              <div className="output-block">
                <div className="section-label">Output</div>
                <div className="output-content">{output}</div>
              </div>

              {hint && (
                <div className="result-block">
                  <div className="section-label">💡 AI Hint</div>
                  <div className="result-card result-hint">{hint}</div>
                </div>
              )}

              {review && (
                <div className="result-block">
                  <div className="section-label">🔍 AI Code Review</div>
                  <div className="result-card result-review">{review}</div>
                </div>
              )}

              <div className="result-block">
                <div className="section-label">❓ Ask AI about your code</div>
                <div className="ask-row">
                  <input
                    className="ask-input"
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. Why is this O(n)? What edge case am I missing?"
                  />
                  <button className="btn btn-primary" onClick={askExplanation} disabled={loadingExplain}>
                    {loadingExplain ? 'Asking...' : 'Ask'}
                  </button>
                </div>
                {explanation && (
                  <div className="result-card result-ask" style={{ marginTop: '12px' }}>{explanation}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />

      <div className="hero">
        <div className="hero-inner">
          <div>
            <div className="eyebrow">// practice.solve.ship</div>
            <h1>Solve real problems.<br />Get real AI feedback.</h1>
            <p className="sub">
              A self-hosted coding practice platform with live code execution,
              AI-powered hints, and instant code review — no black-box judge, no waiting.
            </p>
            <div className="stat-row">
              <div>
                <div className="stat-num">{questions.length}</div>
                <div className="stat-label">Problems</div>
              </div>
              <div>
                <div className="stat-num">2</div>
                <div className="stat-label">Languages</div>
              </div>
              <div>
                <div className="stat-num">AI</div>
                <div className="stat-label">Powered</div>
              </div>
            </div>
          </div>

          <div className="mock-window">
            <div className="window-chrome">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
              <span className="window-filename">two_sum.py</span>
            </div>
            <div className="mock-code">
              <div><span className="c-kw">def</span> <span className="c-fn">two_sum</span>(nums, target):</div>
              <div>&nbsp;&nbsp;<span className="c-var">seen</span> = {'{}'}</div>
              <div>&nbsp;&nbsp;<span className="c-kw">for</span> i, num <span className="c-kw">in</span> enumerate(nums):</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="c-var">complement</span> = target - num</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;<span className="c-kw">if</span> complement <span className="c-kw">in</span> seen:</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="c-kw">return</span> [seen[complement], i]</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;seen[num] = i</div>
              <div className="c-com">&nbsp;&nbsp;# O(n) — one pass, hashmap lookup</div>
            </div>
          </div>
        </div>
      </div>

      <div className="page">
        <div className="section-label">Choose a problem</div>
        <ul className="question-list">
          {questions.map(q => (
            <li key={q.id} className="question-card" onClick={() => setSelected(q)}>
              <div className="q-left">
                <span className={`diff-dot ${q.difficulty}`}></span>
                <span className="question-title">{q.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className={`difficulty-badge difficulty-${q.difficulty}`}>{q.difficulty}</span>
                <span className="arrow">→</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;