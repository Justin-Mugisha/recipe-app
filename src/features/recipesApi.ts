import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface Recipe {
  id: number;
  name: string;
  title?: string;
  description: string;
  cuisine: string;
  caloriesPerServing: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: string;
  image: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  userId: number;
  rating: number;
  reviewCount: number;
  mealType: string[];
}

interface RecipesResponse {
  recipes: Recipe[];
  total: number;
  skip: number;
  limit: number;
}

interface AddRecipeRequest {
  title: string;
  description: string;
}

interface GetRecipesParams {
  search?: string;
  page?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export const recipesApi = createApi({
  reducerPath: "recipesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://dummyjson.com/",
  }),
  endpoints: (builder) => ({
    getRecipes: builder.query<RecipesResponse, GetRecipesParams>({
      query: ({ search = "", page = 0, sortBy = "name", order = "asc" }) =>
        `recipes/search?q=${search}&limit=6&skip=${page * 6}&sortBy=${sortBy}&order=${order}`,
    }),

    addRecipe: builder.mutation<Recipe, AddRecipeRequest>({
      query: (recipe) => ({
        url: "recipes/add",
        method: "POST",
        body: recipe,
      }),
    }),

    updateRecipe: builder.mutation<Recipe, { id: number; [key: string]: unknown }>({
      query: ({ id, ...data }) => ({
        url: `recipes/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    deleteRecipe: builder.mutation<{ isDeleted: boolean; id: number }, number>({
      query: (id) => ({
        url: `recipes/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetRecipesQuery,
  useAddRecipeMutation,
  useUpdateRecipeMutation,
  useDeleteRecipeMutation,
} = recipesApi;
