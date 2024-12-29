export function layout(title, content) {
    return `
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          padding: 80px;
          font: 16px Helvetica, Arial;
        }
    
        h1 {
          font-size: 2em;
        }
    
        h2 {
          font-size: 1.2em;
        }
        h3 {
          font-size: 1em;
        }
    
        #posts {
          margin: 0;
          padding: 0;
        }
    
        #posts li {
          margin: 40px 0;
          padding: 0;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
          list-style: none;
        }
    
        #posts li:last-child {
          border-bottom: none;
        }
    
        textarea {
          width: 500px;
          height: 300px;
        }
    
        input[type=text],input[type=password],
        textarea {
          border: 1px solid #eee;
          border-top-color: #ddd;
          border-left-color: #ddd;
          border-radius: 2px;
          padding: 15px;
          font-size: .8em;
        }
    
        input[type=text],input[type=password] {
          width: 500px;
        }
      </style>
    </head>
    <body>
      <section id="content">
        ${content}
      </section>
    </body>
    </html>
    `
  }

export function show(post) {
  let comments = post.comments
    ? post.comments
        .map(c => `<li><strong>${c.username}</strong>: ${c.content} <em>(${new Date(c.timestamp).toLocaleString()})</em></li>`)
        .join('\n')
    : '<p>No comments yet.</p>';

  return layout(post.title, `
    <h1>${post.title} -- by ${post.username}</h1>
    <p>${post.body}</p>

    <h2>Comments</h2>
    <ul>${comments}</ul>

    <h3>Add a Comment</h3>
    <form action="/post/${post.id}/comment" method="post">
      <p><input type="text" placeholder="Your name" name="username"></p>
      <p><textarea placeholder="Your comment" name="content"></textarea></p>
      <p><input type="submit" value="Submit"></p>
    </form>

    <h3>Share this Post</h3>
    <p>
      <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`http://example.com/post/${post.id}`)}" target="_blank">Share on Twitter</a>
      |
      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`http://example.com/post/${post.id}`)}" target="_blank">Share on Facebook</a>
    </p>
  `);
}
