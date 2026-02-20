/*
 * An array of routes that are used for the authentication process
 * These routes will redirect logged in users to /profile
 * @type {string[]}
 */
export const authRoutes = [
  "/login",
];

/*
 * The default redirect route after a successful login
 * This route is used when the user is redirected after a successful login
 * @type {string}
 */
export const DEFAULT_AUTH_REDIRECT = "/";

/*
 * The default redirect route if unauthorized
 * This route is used when the user is redirected if they are not authorized
 * @type {string}
 */
export const DEFAULT_UNAUTH_REDIRECT = "/login";
