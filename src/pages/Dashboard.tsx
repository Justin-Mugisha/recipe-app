import { useState } from "react";
import type { FC } from "react";
import {
  useGetRecipesQuery,
  useAddRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
} from "@/features/recipesApi";
import { useMeQuery } from "@/features/authApi";

const Dashboard: FC = () => {
  const [page] = useState(0);
  const [search] = useState("");
  const { data, isLoading, refetch } = useGetRecipesQuery({ page, search });
  const { data: user } = useMeQuery();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [addRecipe] = useAddRecipeMutation();
  const [updateRecipe] = useUpdateRecipeMutation();
  const [deleteRecipe] = useDeleteRecipeMutation();

  const handleAdd = async (): Promise<void> => {
    if (!title) return;
    await addRecipe({ title, description }).unwrap();
    setTitle("");
    setDescription("");
    refetch();
  };

  const handleUpdate = async (id: number): Promise<void> => {
    const newTitle = prompt("New title");
    if (!newTitle) return;
    await updateRecipe({ id, title: newTitle }).unwrap();
    refetch();
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!confirm("Delete recipe?")) return;
    await deleteRecipe(id).unwrap();
    refetch();
  };

  if (isLoading) return <h2 className="text-2xl font-bold p-4">Loading...</h2>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome, {user?.firstName} {user?.lastName}
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-2xl font-semibold mb-4">Add Recipe</h3>
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
          <h3 className="text-2xl font-semibold mb-4">Your Recipes</h3>
          {data?.recipes?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.recipes.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
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
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg">No recipes found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
