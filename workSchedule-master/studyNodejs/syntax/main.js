var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./template.js');
var path = require('path');

var app = http.createServer(function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    console.log(pathname);
    if(pathname==='/'){
      if(queryData.id === undefined){ // 홈
          fs.readdir('./data', function(error, filelist){
            var list = template.list(filelist);
            var title = 'Welcome';
            var description = 'Hello, Node.js';
            var html = template.html(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
            response.writeHead(200);
            response.end(html);
          })
      }
      else{
        var filteredId = path.parse(queryData.id).base;
        fs.readdir('./data', function(error, filelist){
          fs.readFile(`./data/${filteredId}`, 'utf8', function(err, description){
            var list = template.list(filelist);
            var title = queryData.id;
            var html = template.html(title, list, `<h2>${title}</h2>${description}`
            , `
              <a href="/create">create</a>
              <a href="/update?id=${title}">update</a>
              <form action="/delete_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
              </form>
              `
            );
            response.writeHead(200);
            response.end(html);
           })
          })
       }
      }
      else if(pathname==='/create'){
        fs.readdir('./data', function(error, filelist){
          var list = template.list(filelist);
          var title = 'WEB - create';
          var description = 'Hello, Node.js';
          var html = template.html(title, list, `
            <form action="/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p><textarea name="description" placeholder="description"></textarea></p>
              <p><input type="submit"></p>
            </form>
          `, '');
          response.writeHead(200);
          response.end(html);
        })  
      }
      else if(pathname === '/create_process'){
        var body = '';
        request.on('data', function(data){ // 데이터가 들어올 때마다 호출
          body += data;
        });
        request.on('end', function(){ // 데이터 수신이 끝나면 호출
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description;
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end(); 
          })
          
        });
      }
      else if(pathname === '/update'){
        fs.readdir('./data', function(error, filelist){
          fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
            var title = queryData.id;
            var list = template.list(filelist);
            var html = template.html(title, list, 
              `
                <form action="/update_process" method="post">
                  <input type="hidden" name="id" value="${title}">
                  <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                  <p><textarea name="description" placeholder="description">${description}</textarea></p>
                  <p><input type="submit" value="저장"></p>
                </form>
              `, `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
            response.writeHead(200);
            response.end(html);
          })
        })
      }
      else if(pathname === '/update_process'){
        var body = '';
        request.on('data', function(data){
          body += data;
        })
        request.on('end', function(){
          console.log(body);
          var post = qs.parse(body);
          var id= post.id;
          var title = post.title;
          var description = post.description;
          console.log(post);
          fs.rename(`data/${id}`, `data/${title}`, function(err){
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.writeHead(302, {Location: `/?id=${title}`});
              response.end();
            })
          })
        })
      }
      else if(pathname === '/delete_process'){
        var body = '';
        request.on('data', function(data){
          body += data;
        })
        request.on('end', function(){
          var post = qs.parse(body);
          var id= post.id;
          fs.unlink(`data/${id}`, function(err){
            response.writeHead(302, {Location:`/`});
            response.end();
          })
        });
      }
      else{ // 이도저도 아닌 것.
        response.writeHead(404);
        response.end('Not Found');
      }
  });
app.listen(3000);