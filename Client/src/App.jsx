import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/todos";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then(setTodos)
      .catch(console.error);
  }, []);

  async function addTodo(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const newTodo = await res.json();
    setTodos([...todos, newTodo]);
    setText("");
  }

  async function removeTodo(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setTodos(todos.filter((t) => t.id !== id));
  }

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1>Todos</h1>
      <form onSubmit={addTodo}>
        <input value={text} onChange={(e) => setText(e.target.value)} />
        <button>Add</button>
      </form>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            {t.text} <button onClick={() => removeTodo(t.id)}>x</button>
          </li>
        ))}
      </ul>
    </div>
  );
}