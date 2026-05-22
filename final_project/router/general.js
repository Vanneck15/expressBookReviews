const express = require('express');
const axios = require('axios'); // Ajout d'Axios pour la Tâche 10
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Le nom d'utilisateur et le mot de passe sont obligatoires." });
  }

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Ce nom d'utilisateur existe déjà." });
  }

  users.push({ "username": username, "password": password });
  
  return res.status(201).json({ message: `L'utilisateur ${username} a été enregistré avec succès ! Vous pouvez maintenant vous connecter.` });
});

// Tâche 10 : Obtenir la liste des livres disponibles en utilisant async-await (ou Promesses) avec Axios
public_users.get('/', async function (req, res) {
  try {
    // Dans le cadre de ce projet local, on encapsule la récupération dans une Promesse résolue
    // afin de simuler un appel asynchrone à notre source de données (booksdb.js).
    // Note : Si vous préférez appeler une API distante, remplacez par : await axios.get('URL_API')
    const fetchBooks = () => new Promise((resolve) => resolve(books));
    const availableBooks = await fetchBooks();
    
    // On formate et renvoie la liste des livres trouvés
    return res.status(200).send(JSON.stringify(availableBooks, null, 2));
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la récupération des livres", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 2));
  } else {
    return res.status(404).json({ message: "Livre non trouvé pour cet ISBN" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const targetAuthor = req.params.author.toLowerCase();
  const bookKeys = Object.keys(books);
  let matchingBooks = [];

  bookKeys.forEach(key => {
    if (books[key].author.toLowerCase() === targetAuthor) {
      matchingBooks.push({
        isbn: key,
        ...books[key]
      });
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).send(JSON.stringify(matchingBooks, null, 2));
  } else {
    return res.status(404).json({ message: "Aucun livre trouvé pour cet auteur" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const targetTitle = req.params.title.toLowerCase();
  const bookKeys = Object.keys(books);
  let matchingBooks = [];

  bookKeys.forEach(key => {
    if (books[key].title.toLowerCase() === targetTitle) {
      matchingBooks.push({
        isbn: key,
        ...books[key]
      });
    }
  });

  if (matchingBooks.length > 0) {
    return res.status(200).send(JSON.stringify(matchingBooks, null, 2));
  } else {
    return res.status(404).json({ message: "Aucun livre trouvé avec ce titre" });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 2));
  } else {
    return res.status(404).json({ message: "Livre non trouvé pour cet ISBN" });
  }
});

module.exports.general = public_users;