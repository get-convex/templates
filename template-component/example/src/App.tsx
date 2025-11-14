import "./App.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

function App() {
  const notes = useQuery(api.example.list, {});
  const addNote = useMutation(api.example.add);
  const [noteText, setNoteText] = useState("");

  const handleAddNote = () => {
    if (noteText.trim()) {
      addNote({ text: noteText });
      setNoteText("");
    }
  };

  return (
    <>
      <h1>Sample Component Example</h1>
      <div className="card">
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Enter a note"
            style={{ marginRight: "0.5rem", padding: "0.5rem" }}
            onKeyPress={(e) => e.key === "Enter" && handleAddNote()}
          />
          <button onClick={handleAddNote}>Add Note</button>
        </div>
        <div>
          <h3>Notes ({notes?.length ?? 0})</h3>
          <ul style={{ textAlign: "left" }}>
            {notes?.map((note) => (
              <li key={note._id}>{note.text}</li>
            ))}
          </ul>
        </div>
        <p>
          See <code>example/convex/example.ts</code> for all the ways to use
          this component
        </p>
      </div>
    </>
  );
}

export default App;
