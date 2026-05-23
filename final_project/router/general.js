const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ---------------------------------------------------------------------
// FONCTIONS ASYNC / PROMISSES (Simulant des requêtes Axios / Base de données)
// ---------------------------------------------------------------------

// Simule la récupération asynchrone de toute la liste des livres
const getAllBooksAsync = () => {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject({ message: "Impossible de charger les livres" });
        }
    });
};

// Simule la recherche asynchrone d'un livre par son ISBN
const getBookByISBNAsync = (isbn) => {
    return new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject({ status: 404, message: "Livre non trouvé" });
        }
    });
};


// ---------------------------------------------------------------------
// ROUTES PUBLIQUES
// ---------------------------------------------------------------------

// Tâche 10 : Récupérer la liste de tous les livres disponibles (Async/Await)
public_users.get('/', async function (req, res) {
    try {
        // Attente de la résolution de la promesse pour obtenir les livres
        const booksList = await getAllBooksAsync();
        return res.status(200).json(booksList);
    } catch (error) {
        return res.status(500).json({ message: error.message || "Erreur interne du serveur" });
    }
});

// Tâche 11 : Récupérer les détails d'un livre basé sur son ISBN (Async/Await)
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        // Attente de la recherche du livre par ISBN
        const book = await getBookByISBNAsync(isbn);
        return res.status(200).json(book);
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
    }
 });
  
// Tâche 12 : Récupérer les détails d'un livre basé sur l'Auteur (Async/Await)
public_users.get('/author/:author', async function (req, res) {
    const authorParam = req.params.author.toLowerCase();
    try {
        // 1. Récupération de tous les livres de manière asynchrone
        const allBooks = await getAllBooksAsync();
        const filteredBooks = [];

        // 2. Filtrage des livres correspondant à l'auteur spécifié
        Object.keys(allBooks).forEach((isbn) => {
            if (allBooks[isbn].author.toLowerCase() === authorParam) {
                filteredBooks.push({
                    isbn: isbn,
                    title: allBooks[isbn].title,
                    reviews: allBooks[isbn].reviews
                });
            }
        });

        // 3. Gestion de la réponse selon le résultat du filtre
        if (filteredBooks.length > 0) {
            return res.status(200).json({ booksByAuthor: filteredBooks });
        } else {
            return res.status(404).json({ message: "Aucun livre trouvé pour cet auteur" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la recherche par auteur" });
    }
});

// Tâche 13 : Récupérer les détails d'un livre basé sur le Titre (Async/Await)
public_users.get('/title/:title', async function (req, res) {
    const titleParam = req.params.title.toLowerCase();
    try {
        // 1. Récupération de tous les livres de manière asynchrone
        const allBooks = await getAllBooksAsync();
        const filteredBooks = [];

        // 2. Filtrage des livres dont le titre correspond au paramètre
        Object.keys(allBooks).forEach((isbn) => {
            if (allBooks[isbn].title.toLowerCase() === titleParam) {
                filteredBooks.push({
                    isbn: isbn,
                    author: allBooks[isbn].author,
                    reviews: allBooks[isbn].reviews
                });
            }
        });

        // 3. Gestion de la réponse selon le résultat du filtre
        if (filteredBooks.length > 0) {
            return res.status(200).json({ booksByTitle: filteredBooks });
        } else {
            return res.status(404).json({ message: "Aucun livre trouvé avec ce titre" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la recherche par titre" });
    }
});

// Récupérer les reviews d'un livre basé sur l'ISBN (Route classique)
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Livre non trouvé pour afficher les reviews" });
    }
});

// Inscription d'un nouvel utilisateur
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) { 
            users.push({"username": username, "password": password});
            return res.status(200).json({ message: "Utilisateur enregistré avec succès. Vous pouvez vous connecter." });
        } else {
            return res.status(404).json({ message: "Cet utilisateur existe déjà !" });    
        }
    } 
    return res.status(404).json({ message: "Impossible d'enregistrer l'utilisateur : Nom d'utilisateur ou mot de passe manquant." });
});

module.exports = {
    general: public_users
};
