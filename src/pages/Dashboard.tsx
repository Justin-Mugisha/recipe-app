import { useState, useEffect } from "react";
import type { FC } from "react";
import {
  useGetRecipesQuery,
  useAddRecipeMutation,
  useUpdateRecipeMutation,
} from "@/features/recipesApi";
import { useMeQuery } from "@/features/authApi";
import { useNavigate } from "react-router-dom";
import { LogOut, Check } from "lucide-react";

interface LocalRecipe {
  id: number;
  name: string;
  title: string;
  description: string;
  isLocal: boolean;
}

const Dashboard: FC = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [localRecipes, setLocalRecipes] = useState<LocalRecipe[]>(() => {
    const saved = localStorage.getItem("userRecipes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load local recipes", e);
        return [];
      }
    }
    return [];
  });
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetRecipesQuery({ page, search });
  const { data: user } = useMeQuery();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [addRecipe] = useAddRecipeMutation();
  const [updateRecipe] = useUpdateRecipeMutation();

  // Load local recipes from localStorage on mount
  useEffect(() => {
    // This effect is no longer needed since we initialize state with localStorage
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleAdd = async (): Promise<void> => {
    if (!title) {
      setSuccessMessage("⚠️ Please enter a recipe title");
      return;
    }

    try {
      // Add to API
      await addRecipe({ title, description }).unwrap();

      // Add to local storage
      const newRecipe: LocalRecipe = {
        id: Date.now(),
        name: title,
        title: title,
        description: description,
        isLocal: true,
      };

      const updated = [...localRecipes, newRecipe];
      setLocalRecipes(updated);
      localStorage.setItem("userRecipes", JSON.stringify(updated));

      // Show success message
      setSuccessMessage(`✅ Recipe "${title}" added successfully!`);

      // Clear form
      setTitle("");
      setDescription("");

      // Clear search to see newly added recipe
      setSearch("");
      // Reset to first page
      setPage(0);

      // Refresh data after a short delay
      setTimeout(() => refetch(), 500);
    } catch (error) {
      setSuccessMessage("❌ Failed to add recipe. Please try again.");
      console.error(error);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm("Delete recipe?")) return;
    
    try {
      // Remove from local recipes
      const updated = localRecipes.filter((r) => r.id !== id);
      setLocalRecipes(updated);
      localStorage.setItem("userRecipes", JSON.stringify(updated));
      setSuccessMessage("✅ Recipe deleted successfully!");
      refetch();
    } catch (error) {
      setSuccessMessage("❌ Failed to delete recipe.");
      console.error(error);
    }
  };

  const handleUpdate = async (id: number): Promise<void> => {
    const newTitle = prompt("New title");
    if (!newTitle) return;
    try {
      await updateRecipe({ id, title: newTitle }).unwrap();
      
      // Update local recipes
      const updated = localRecipes.map((r) =>
        r.id === id ? { ...r, name: newTitle, title: newTitle } : r
      );
      setLocalRecipes(updated);
      localStorage.setItem("userRecipes", JSON.stringify(updated));
      
      setSuccessMessage("✅ Recipe updated successfully!");
      refetch();
    } catch (error) {
      setSuccessMessage("❌ Failed to update recipe.");
      console.error(error);
    }
  };

  if (isLoading) return <h2 className="text-2xl font-bold p-4">Loading...</h2>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto p-6 flex justify-between items-center">
          <h1 className="text-4xl font-bold">🍳 Recipe-App</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <p className="text-lg text-gray-600 mb-8">
          Welcome, {user?.firstName} {user?.lastName}
        </p>

        {successMessage && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            successMessage.startsWith("✅")
              ? "bg-green-100 border border-green-400 text-green-700"
              : successMessage.startsWith("❌")
              ? "bg-red-100 border border-red-400 text-red-700"
              : "bg-yellow-100 border border-yellow-400 text-yellow-700"
          }`}>
            {successMessage.startsWith("✅") && <Check size={20} />}
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">🔍 Search Recipes</h3>
          <input
            type="text"
            placeholder="Search by recipe name, ingredients, cuisine..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0); // Reset to first page when searching
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">
                Found {data?.recipes?.length || 0} recipes matching "{search}"
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setPage(0);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold mt-2"
              >
                Clear search to see all recipes
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-2xl font-semibold mb-4">➕ Add Recipe</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAdd}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Add Recipe
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-4">📖 Your Recipes</h3>
          
          {/* Display combined recipes - local recipes first, then API recipes */}
          {(localRecipes.length > 0 || data?.recipes?.length) ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Show local recipes first with a badge */}
                {localRecipes.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition border-2 border-green-300"
                  >
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <img
                        src={`https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop&q=80`}
                        alt={r.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-xl font-semibold flex-1">{r.title}</h4>
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full whitespace-nowrap ml-2">
                          Your Recipe
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{r.description}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(r.id)}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Show API recipes */}
                {data?.recipes?.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <img
                        src={r.image || `https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop&q=80`}
                        alt={r.name || r.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-semibold mb-2">{r.name || r.title}</h4>
                      <p className="text-gray-600 mb-4">{r.description}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(r.id)}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-600 text-lg">No recipes found.</p>
          )}
          
          {!search && (
            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
                  title="Go to first page"
                >
                  ⏮️
                </button>
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
                >
                  ⬅️ Previous
                </button>
                <span className="py-2 px-6 text-gray-600 font-semibold bg-gray-100 rounded-lg">
                  Page {page + 1}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!data?.recipes?.length || data.recipes.length < 6}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
                >
                  Next ➜
                </button>
                <button
                  onClick={() => {
                    // Calculate max page (assuming 6 items per page and total count from data)
                    const maxPage = data?.total ? Math.ceil(data.total / 6) - 1 : page;
                    setPage(Math.max(0, maxPage));
                  }}
                  disabled={!data?.recipes?.length || data.recipes.length < 6}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
                  title="Go to last page"
                >
                  ⏭️
                </button>
              </div>
              {data?.total && (
                <p className="text-sm text-gray-600">
                  Showing {page * 6 + 1} - {Math.min((page + 1) * 6, data.total)} of {data.total} recipes
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
