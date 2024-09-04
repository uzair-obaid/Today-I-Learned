import { useEffect, useState } from "react";
import "./style.css";
import supabase from "./supabase";

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");
  //[] ensures data is rendered only when App is first loaded
  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        let query = supabase.from("facts").select("*");
        if (currentCategory !== "all")
          query = query.eq("category", currentCategory);
        const { data: facts, error } = await query
          .order("votesInteresting", { ascending: false })
          .limit(500);

        if (!error) setFacts(facts);
        else alert("There was a problem getting data");
        setIsLoading(false);
      }
      getFacts();
    },
    [currentCategory]
  );
  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />
      {/* <Counter /> */}
      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}
      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" alt="logo" />
        <h1>Today I Learned</h1>
      </div>
      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((s) => !s)}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(e) {
    //1.Prevent the browser reload
    e.preventDefault();
    console.log(text, source, category);

    // 2.Check if data is valid.
    if (text && isValidHttpUrl(source) && category) {
      //3.create a new fact object
      // const newFact = {
      //   id: Math.round(Math.random() * 10000),
      //   text: text,
      //   source: source,
      //   category: category,
      //   votesInteresting: 0,
      //   votesMindblowing: 0,
      //   votesFalse: 0,
      //   createdIn: new Date().getFullYear(),
      // };

      //uploading
      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category }])
        .select();
      setIsUploading(false);
      //4.Add  the new fact to  the UI:Add the fact to  the state
      if (!error) setFacts((facts) => [newFact[0], ...facts]);

      //5.Reset the input field
      setText("");
      setSource("");
      setCategory("");

      //6.close the form
      setShowForm(false);
    }
  }
  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name=""
        id=""
        placeholder="Share a fact with World..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={200}
        disabled={isUploading}
      />

      <span>{200 - text.length}</span>
      <input
        type="text"
        name=""
        id=""
        placeholder="Trustworthy source.."
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        name=""
        id=""
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Choose Category</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
        disabled={isUploading}
      </select>
      <button className="btn btn-large">Post</button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{
                backgroundColor: cat.color,
              }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0) {
    return (
      <p className="message">
        No facts for this category yet! Create the first one.
      </p>
    );
  }
  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed =
    fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", fact.id)
      .select();
    setIsUpdating(false);

    if (!error && updatedFact.length > 0) {
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
    } else {
      console.error("Error updating the fact:", error);
      // You might want to display an error message to the user here
    }
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[⛔️DISPUTED]</span> : null}
        {fact.text}
        <a
          className="source"
          href={fact.source}
          target="_blank"
          rel="noopener noreferrer"
        >
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            .color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => handleVote("votesInteresting")}
          disabled={isUpdating}
        >
          👍 {fact.votesInteresting}
        </button>
        <button
          onClick={() => handleVote("votesMindblowing")}
          disabled={isUpdating}
        >
          🤯 {fact.votesMindblowing}
        </button>
        <button onClick={() => handleVote("votesFalse")} disabled={isUpdating}>
          ⛔️ {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}

export default App;
