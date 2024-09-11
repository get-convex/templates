import "./App.css";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function App() {
  const count = useQuery(api.app.getCount);
  const addOne = useMutation(api.app.addOne);

  return (
    <>
      <h1>Convex Counter Component Example</h1>
      <div className="card">
        <button onClick={() => addOne()}>count is {count}</button>
        <p>
          See <code>example/convex/example.ts</code> for all the ways to use
          this component
        </p>
      </div>
    </>
  );
}

export default App;
