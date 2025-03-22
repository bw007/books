const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/') res.end(`<a href="/books">Book list</a>`);

  if (req.url === '/books' && req.method === 'GET') {
    fs.readFile(path.join(__dirname, 'data', 'books.json'), 'utf-8', (err, data) => {
      res.setHeader('content-type', 'application/json')
      res.end(data)
    });
  }
  
  if (req.url.startsWith('/books/') && req.method === 'GET') {
    fs.readFile(path.join(__dirname, 'data', 'books.json'), 'utf-8', (err, data) => {
      const book = JSON.parse(data).find((book) => book.id == req.url.split('/')[2]);

      if (!book) {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ message: 'Ma\'lumot topilmadi' }));
      }

      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(book));
    });
  }

  if (req.url === '/books' && req.method === 'POST') {
    const body = [];
    
    req.on('data', (chunk) => body.push(chunk));
  
    req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const newBook = JSON.parse(parsedBody)
       
      if (Object.keys(newBook).length === 0) {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ message: 'Ma\'lumotlarni to\'liq kiriting' }));
      }
      
      fs.readFile(path.join(__dirname, 'data', 'books.json'), 'utf-8', (err, data) => {
        let books = JSON.parse(data);
        const existingBook = books.find(book => book.title === newBook.title);
        
        if (existingBook) {
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ message: 'Bu kitob bazada mavjud' }));
        }

        const newId = books.length > 0 ? Math.max(...books.map(book => book.id || 0)) + 1 : 1;
  
        books.push({ id: newId, ...newBook });
  
        fs.writeFile(path.join(__dirname, 'data', 'books.json'), JSON.stringify(books, null, 2), 'utf-8', (err) => {
          res.setHeader('Content-Type', 'application/json');         
          res.end(JSON.stringify({ message: 'Ma\'lumot qo\'shildi' }));
        });
      });
    });
  }

  if (req.url.startsWith('/books/') && req.method === 'PUT') {
    const bookId = req.url.split('/')[2];

    const body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    });

    req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const updatedBook = JSON.parse(parsedBody);

      fs.readFile(path.join(__dirname, 'data', 'books.json'), 'utf-8', (err, data) => {
        let books = JSON.parse(data);
        const bookIndex = books.findIndex(book => book.id == bookId);

        if (bookIndex === -1) {
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ message: 'Ma\'lumot topilmadi' }));
        }

        books[bookIndex] = { id: Number(bookId), ...updatedBook };

        fs.writeFile(path.join(__dirname, 'data', 'books.json'), JSON.stringify(books, null, 2), 'utf-8', (err) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Ma\'lumot yangilandi' }));
        });
      });
    })

    if (!bookId) {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ message: 'Ma\'lumot topilmadi' }));
    }
  }

  if (req.url.startsWith('/books/') && req.method === 'DELETE') {
    fs.readFile(path.join(__dirname, 'data', 'books.json'), 'utf-8', (err, data) => {
      let books = JSON.parse(data);
      const bookId = req.url.split('/')[2];
      const bookIndex = books.findIndex(book => book.id == bookId);

      if (bookIndex === -1) {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ message: 'Ma\'lumot topilmadi' }));
      }
      
      books = [ ...books.filter(f => f.id != bookId) ]

      fs.writeFile(path.join(__dirname, 'data', 'books.json'), JSON.stringify(books, null, 2), 'utf-8', (err) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Ma\'lumot o\'chirildi' }));
      });
    });
  }
  
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});