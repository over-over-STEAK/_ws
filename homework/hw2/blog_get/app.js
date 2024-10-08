import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js'

const posts = [
  {id:0, title:'aaa', body:'aaaaa'},
  {id:1, title:'bbb', body:'bbbbb'}
];

const router = new Router();

router.get('/', list)
  .get('/post/new', add)
  .get('/post/:id', show)
  .get('/post', create);

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

async function list(ctx) {
  ctx.response.body = await render.list(posts);
}

async function add(ctx) {
  ctx.response.body = await render.newPost();
}

async function show(ctx) {
  const id = ctx.params.id;
  const post = posts[id];
  if (!post) ctx.throw(404, 'invalid post id');
  ctx.response.body = await render.show(post);
}

async function create(ctx) {

  var params = ctx.request.url.searchParams
  var title = params.get('title')
  var body = params.get('body')
  var post = {title:title, body:body}
  console.log('post=', post)
  const id = posts.push(post) - 1;
  post.created_at = new Date();
  post.id = id;
  ctx.response.body = "success"
  ctx.response.redirect('/');
}

console.log('Server run at http://127.0.0.1:8000')
await app.listen({ port: 8000 });
