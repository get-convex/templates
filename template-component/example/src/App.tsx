import "./App.css";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

function App() {
  const [targetId] = useState("example-subject-1");
  const comments = useQuery(api.example.list, { targetId });
  const addComment = useMutation(api.example.add);
  const convertToPirateTalk = useAction(api.example.convertToPirateTalk);
  const [commentText, setCommentText] = useState("");
  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment({ text: commentText, targetId });
      setCommentText("");
    }
  };
  const handleConvertToPirateTalk = async (commentId: string) => {
    await convertToPirateTalk({ commentId });
  };

  // Construct the HTTP endpoint URL
  // Replace .convex.cloud with .convex.site for HTTP endpoints

  const convexUrl = (import.meta.env.VITE_CONVEX_URL).replace(".cloud", ".site");

  const httpUrl = convexUrl + `/comments/last?targetId=${encodeURIComponent(targetId)}`;

  return (
    <>
      <h1>Sample Component Example</h1>
      <div className="card">
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Enter a comment"
            style={{ marginRight: "0.5rem", padding: "0.5rem" }}
            onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
          />
          <button onClick={handleAddComment}>Add Comment</button>
        </div>
        <div>
          <h3>Comments ({comments?.length ?? 0})</h3>
          <ul style={{ textAlign: "left" }}>
            {comments?.map((comment) => (
              <li key={comment._id} style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>{comment.text}</span>
                <button 
                  onClick={() => handleConvertToPirateTalk(comment._id)}
                  style={{ 
                    padding: "0.25rem 0.5rem", 
                    fontSize: "0.75rem",
                    backgroundColor: "#ff9800",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  🏴‍☠️ Convert to Pirate Talk
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
          <h3>HTTP Endpoint Demo</h3>
          <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            The component exposes an HTTP endpoint to get the latest comment:
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
            Open HTTP Endpoint (GET /comments/last)
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
