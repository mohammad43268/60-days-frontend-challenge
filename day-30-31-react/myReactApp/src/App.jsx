import { useState } from 'react'
import './index.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        React AI
      </div>
      <ul className="nav-links">
        <li><a href="#features">Architecture</a></li>
        <li><a href="#demos">Playground</a></li>
      </ul>
    </nav>
  )
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-badge">
        <span className="dot"></span> Next-Gen React Engine
      </div>
      <h1>Intelligent <span>UI Design</span></h1>
      <p>A beautifully crafted, beginner-friendly React environment showcasing the power of modern web development, state management, and monochrome UI.</p>
      <a href="#demos" className="hero-btn">Initialize Demos</a>
    </section>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="feature-card">
      <div className="icon">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function Features() {
  const features = [
    { 
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      ), 
      title: 'Neural Components', 
      description: 'Construct your interface using isolated, reusable modules that encapsulate their own rendering logic.' 
    },
    { 
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      ), 
      title: 'Quantum Rendering', 
      description: 'The Virtual DOM acts as a rapid processing layer, calculating minimal diffs for instantaneous UI updates.' 
    },
    { 
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
        </svg>
      ), 
      title: 'State Hooks', 
      description: 'Harness the power of useState to inject memory and reactivity directly into functional elements.' 
    },
  ]

  return (
    <section className="section" id="features">
      <div className="section-title">
        <h2>Core Architecture</h2>
        <p>The fundamental building blocks of modern React</p>
      </div>
      <div className="features-grid">
        {features.map((f) => (
          <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} />
        ))}
      </div>
    </section>
  )
}

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="demo-card">
      <div className="demo-card-header">
        <div className="demo-icon">⚡</div>
        <h3>State Counter</h3>
      </div>
      <p className="subtitle">Real-time memory tracking via useState</p>
      
      <div className="counter-display">
        <div className="counter-value">{count}</div>
      </div>
      
      <div className="counter-btns">
        <button className="counter-btn minus" onClick={() => setCount(count - 1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button className="counter-btn reset" onClick={() => setCount(0)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
        </button>
        <button className="counter-btn plus" onClick={() => setCount(count + 1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
    </div>
  )
}

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Initialize React environment', done: true },
    { id: 2, text: 'Construct monochrome UI', done: true },
    { id: 3, text: 'Master state management', done: false },
  ])
  const [input, setInput] = useState('')

  function addTodo() {
    if (!input.trim()) return
    setTodos([...todos, { id: Date.now(), text: input, done: false }])
    setInput('')
  }

  function toggleTodo(id) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  function deleteTodo(id) {
    setTodos(todos.filter((t) => t.id !== id))
  }

  return (
    <div className="demo-card">
      <div className="demo-card-header">
        <div className="demo-icon">📋</div>
        <h3>Task Matrix</h3>
      </div>
      <p className="subtitle">Array mutation and dynamic rendering</p>
      
      <div className="todo-input">
        <input
          type="text"
          placeholder="Input new objective..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
        />
        <button className="todo-add-btn" onClick={addTodo}>Compile</button>
      </div>
      
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />
            <span className={todo.done ? 'done' : ''}>{todo.text}</span>
            <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Demos() {
  return (
    <section className="section" id="demos">
      <div className="section-title">
        <h2>Interactive Playground</h2>
        <p>Live demonstrations of React hooks and data flow</p>
      </div>
      <div className="demo-grid">
        <Counter />
        <TodoList />
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      Engineered with <span>♥</span> by AI — {new Date().getFullYear()}
    </footer>
  )
}

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Demos />
      <Footer />
    </>
  )
}
