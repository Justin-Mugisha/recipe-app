import { useState } from "react";
import type { FC } from "react";
import { useGetRecipesQuery } from "@/features/recipesApi";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const Landing: FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const navigate = useNavigate();

  const { data, isLoading } = useGetRecipesQuery({
    search,
    page,
    sortBy,
    order,
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (isLoading) return <h2 className="text-2xl font-bold p-4">Loading...</h2>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto p-6 flex justify-between items-center">
          <h1 className="text-4xl font-bold">Recipes</h1>
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="space-y-4 md:space-y-0 md:flex md:gap-4">
            <input
              type="text"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="caloriesPerServing">Calories</option>
            </select>

            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {data?.recipes?.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={r.image}
                alt={r.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{r.name}</h3>
                <p className="text-gray-600">{r.description}</p>
                <div className="mt-4 flex justify-between text-sm text-gray-500">
                  <span>⏱ {r.prepTimeMinutes} min</span>
                  <span>⭐{r.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
          >
            Previous
          </button>
          <span className="py-2 text-gray-600">Page {page + 1}</span>
          <button
            onClick={() => setPage(page + 1)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
