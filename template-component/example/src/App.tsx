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

  // Construct the HTTP endpoint URL
  // Replace .convex.cloud with .convex.site for HTTP endpoints

  const convexUrl = (import.meta.env.VITE_CONVEX_URL).replace(".cloud", ".site");

  const httpUrl = convexUrl + "/notes/last";

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
        <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
          <h3>HTTP Endpoint Demo</h3>
          <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            The component exposes an HTTP endpoint to get the latest note:
          </p>
          <a 
            href={httpUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: "inline-block",
              padding: "0.5rem 1rem", 
              backgroundColor: "#007bff", 
              color: "white", 
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "0.9rem"
            }}
          >
            Open HTTP Endpoint (GET /notes/last)
          </a>
          <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem" }}>
            See <code>example/convex/http.ts</code> for the HTTP route configuration
          </p>
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
