/**
 * Inner `user` object from GET /users/{user_id} and POST /users/.
 * Backend inserts/selects Supabase `users` with UserCreateRequest fields
 * (name, email) plus the row `id` used in GET /users/{user_id}.
 */
export type User = {
  id: string;
  name: string;
  email: string;
};

/** Envelope returned by GET /users/{user_id} and POST /users/. */
export type UserResponse = {
  success: boolean;
  user: User | null;
};
