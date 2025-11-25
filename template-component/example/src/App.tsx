import "./App.css";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

// Fake blog posts (not in database)
const blogPosts = [
  {
    id: "blog-post-1",
    title: "Getting Started with Convex Components",
    content:
      "Convex components are a powerful way to build reusable functionality that can be shared across different applications. In this post, we'll explore how to create and use components in your Convex applications.",
    author: "Jane Doe",
    date: "2024-01-15",
  },
  {
    id: "blog-post-2",
    title: "Building Scalable Comment Systems",
    content:
      "Comments are a fundamental feature of many web applications. Learn how to build a scalable comment system using Convex components that can handle thousands of comments efficiently.",
    author: "John Smith",
    date: "2024-01-20",
  },
];

function BlogPostComments({ postId }: { postId: string }) {
  const comments = useQuery(api.example.list, { targetId: postId });
  const addComment = useMutation(api.example.add);
  const translateComment = useAction(api.example.translateComment);
  const [commentText, setCommentText] = useState("");

  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment({ text: commentText, targetId: postId });
      setCommentText("");
    }
  };

  const handleTranslateComment = async (commentId: string) => {
    await translateComment({ commentId });
  };

  return (
    <div
      style={{
        marginTop: "1.5rem",
        padding: "1rem",
        border: "1px solid rgba(128, 128, 128, 0.3)",
        borderRadius: "8px",
      }}
    >
      <h4 style={{ marginTop: 0, marginBottom: "1rem" }}>
        Comments ({comments?.length ?? 0})
      </h4>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Enter a comment"
          style={{ marginRight: "0.5rem", padding: "0.5rem", width: "70%" }}
          onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
        />
        <button onClick={handleAddComment}>Add Comment</button>
      </div>
      <ul style={{ textAlign: "left", listStyle: "none", padding: 0 }}>
        {comments?.map((comment) => (
          <li
            key={comment._id}
            style={{
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem",
              backgroundColor: "rgba(128, 128, 128, 0.1)",
              borderRadius: "4px",
            }}
          >
            <span style={{ flex: 1 }}>{comment.text}</span>
            <button
              onClick={() => handleTranslateComment(comment._id)}
              style={{
                padding: "0.25rem 0.5rem",
                fontSize: "0.75rem",
                backgroundColor: "#ff9800",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              🏴‍☠️ Translate to Pirate Talk
            </button>
          </li>
        ))}
        {comments?.length === 0 && (
          <li
            style={{ color: "rgba(128, 128, 128, 0.8)", fontStyle: "italic" }}
          >
            No comments yet. Be the first to comment!
          </li>
        )}
      </ul>
    </div>
  );
}

function App() {
  // Construct the HTTP endpoint URL
  // Replace .convex.cloud with .convex.site for HTTP endpoints
  const convexUrl = import.meta.env.VITE_CONVEX_URL.replace(".cloud", ".site");

  return (
    <>
      <h1>Example App</h1>
      <div className="card">
        {blogPosts.map((post) => (
          <div
            key={post.id}
            style={{
              marginBottom: "2rem",
              padding: "1.5rem",
              border: "1px solid rgba(128, 128, 128, 0.3)",
              borderRadius: "8px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>{post.title}</h2>
            <div
              style={{
                marginBottom: "0.5rem",
                color: "rgba(128, 128, 128, 0.8)",
                fontSize: "0.9rem",
              }}
            >
              By {post.author} • {post.date}
            </div>
            <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
              {post.content}
            </p>
            <BlogPostComments postId={post.id} />
          </div>
        ))}
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            backgroundColor: "rgba(128, 128, 128, 0.1)",
            borderRadius: "8px",
          }}
        >
          <h3>HTTP Endpoint Demo</h3>
          <p style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            The component exposes an HTTP endpoint to get the latest comment:
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {blogPosts.map((post) => {
              const httpUrl =
                convexUrl +
                `/comments/last?targetId=${encodeURIComponent(post.id)}`;
              return (
                <a
                  key={post.id}
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
                    fontSize: "0.9rem",
                  }}
                >
                  {post.title} - HTTP Endpoint
                </a>
              );
            })}
          </div>
          <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem" }}>
            See <code>example/convex/http.ts</code> for the HTTP route
            configuration
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
