import { useState, type FormEvent } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [ingredientText, setIngredientText] = useState("");
  const [recipe, setRecipe] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateRecipe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const ingredients = ingredientText
      .split(",")
      .map((ingredient) => ingredient.trim())
      .filter(Boolean);

    if (ingredients.length === 0) {
      setError("Enter at least one ingredient.");
      return;
    }

    setError("");
    setRecipe("");
    setLoading(true);

    try {
      const { data, errors } = await client.queries.askBedrock(
        { ingredients },
        { authMode: "userPool" },
      );

      if (errors?.length) {
        throw new Error(errors[0]?.message || "Recipe generation failed.");
      }

      if (!data?.body) {
        throw new Error("Bedrock returned an empty recipe. Try again.");
      }

      setRecipe(data.body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recipe generation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Authenticator>
      {({ signOut }) => (
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
          <header>
            <h1>Recipe AI</h1>
            <p>Built by Rijan Bhattarai</p>
          </header>

          <form onSubmit={generateRecipe}>
            <label htmlFor="ingredients">
              Enter your ingredients, separated by commas
            </label>
            <input
              id="ingredients"
              value={ingredientText}
              onChange={(event) => setIngredientText(event.target.value)}
              placeholder="rice, eggs, onion"
              required
              style={{
                display: "block",
                boxSizing: "border-box",
                width: "100%",
                padding: "10px",
                margin: "8px 0",
              }}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Generating…" : "Generate recipe"}
            </button>{" "}
            <button type="button" onClick={signOut} disabled={loading}>
              Sign out
            </button>
          </form>

          {error && <p role="alert">{error}</p>}
          {recipe && (
            <section>
              <h2>Your recipe</h2>
              <div style={{ whiteSpace: "pre-wrap" }}>{recipe}</div>
            </section>
          )}
        </main>
      )}
    </Authenticator>
  );
}