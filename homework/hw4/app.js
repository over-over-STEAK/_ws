import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions/mod.ts";
import * as render from './render.js';
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("blog.db");
db.query("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, title TEXT, body TEXT)");
db.query("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, email TEXT)");

export function query(sql, params = []) {
  try {
    const result = db.query(sql, params);
    return result;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Database query failed");
  }
}

export function getUserByUsername(username) {
  const result = query("SELECT id, username, password, email FROM users WHERE username=?", [username]);
  return result.length > 0 ? result[0] : null;
}

export function getAllPosts() {
  const result = query("SELECT id, username, title, body FROM posts");
  return result.map(([id, username, title, body]) => ({ id, username, title, body }));
}

export function getPostsByUser(username) {
  const result = query("SELECT id, username, title, body FROM posts WHERE username=?", [username]);
  return result.map(([id, username, title, body]) => ({ id, username, title, body }));
}

export function createUser(username, password, email) {
  query("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [username, password, email]);
}

export function createPost(username, title, body) {
  query("INSERT INTO posts (username, title, body) VALUES (?, ?, ?)", [username, title, body]);
}

const router = new Router();

router.get('/', list)
  .get('/signup', signupUi)
  .post('/signup', signup)
  .get('/login', loginUi)
  .post('/login', login)
  .get('/logout', logout)
  .get('/post/new', add)
  .get('/post/:id', show)
  .post('/post', create)
  .get('/list/:user', listUserPosts);

const app = new Application();
app.use(Session.initMiddleware());
app.use(router.routes());
app.use(router.allowedMethods());

async function signup(ctx) {
  const body = ctx.request.body();
  if (body.type() === "form") {
    const user = await body.value;
    const existingUser = await getUserByUsername(user.username);
    if (!existingUser) {
      createUser(user.username, user.password, user.email);
      ctx.response.body = render.success();
    } else {
      ctx.response.body = render.fail();
    }
  }
}

async function login(ctx) {
  const body = ctx.request.body();
  if (body.type() === "form") {
    const user = await body.value;
    const dbUser = await getUserByUsername(user.username);
    if (dbUser && dbUser.password === user.password) {
      ctx.state.session.set('user', user);
      ctx.response.redirect('/');
    } else {
      ctx.response.body = render.fail();
    }
  }
}

async function list(ctx) {
  const posts = getAllPosts();
  ctx.response.body = await render.list(posts, await ctx.state.session.get('user'));
}

async function listUserPosts(ctx) {
  const username = ctx.params.user;
  const posts = getPostsByUser(username);
  ctx.response.body = await render.listUserPosts(posts, username);
}

async function show(ctx) {
  const pid = ctx.params.id;
  const posts = getAllPosts();
  const post = posts.find(p => p.id == pid);
  if (!post) ctx.throw(404, 'Post not found');
  ctx.response.body = await render.show(post);
}

async function add(ctx) {
  const user = await ctx.state.session.get('user');
  if (user) {
    ctx.response.body = await render.newPost();
  } else {
    ctx.response.body = render.fail();
  }
}

async function create(ctx) {
  const body = ctx.request.body();
  if (body.type() === "form") {
    const post = await body.value;
    const user = await ctx.state.session.get('user');
    if (user) {
      createPost(user.username, post.title, post.body);
      ctx.response.redirect('/');
    } else {
      ctx.throw(404, 'Not logged in');
    }
  }
}

async function logout(ctx) {
  ctx.state.session.set('user', null);
  ctx.response.redirect('/');
}

console.log('Server running on http://127.0.0.1:8000');
await app.listen({ port: 8000 });
