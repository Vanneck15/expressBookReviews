const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Vérifie si le nom d'utilisateur est valide
const isValid = (username) => {
  return username && username.trim().length > 0;
}

// Vérifie si le nom d'utilisateur et le mot de passe correspondent
const authenticatedUser = (username, password) => {
  const matchingUser = users.find((user) => user.username === username && user.password === password);
  return !!matchingUser;
}

// Tâche 7 : Connexion d'un utilisateur enregistré
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Le nom d'utilisateur et le mot de passe sont obligatoires." });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };

    return res.status(200).json({ message: "Connexion réussie ! L'utilisateur est authentifié.", token: accessToken });
  } else {
    return res.status(208).json({ message: "Identifiants invalides. Veuillez vérifier votre nom d'utilisateur ou mot de passe." });
  }
});

// Tâche 8 : Ajouter ou modifier un avis sur un livre
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "Utilisateur non authentifié. Veuillez vous connecter." });
  }

  if (!reviewText) {
    return res.status(400).json({ message: "Le texte de l'avis est obligatoire." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Livre non trouvé pour cet ISBN." });
  }

  books[isbn].reviews[username] = reviewText;

  return res.status(200).json({ 
    message: `L'avis de l'utilisateur '${username}' a été ajouté/modifié avec succès pour l'ISBN ${isbn}.`,
    reviews: books[isbn].reviews
  });
});

// Tâche 9 : Supprimer un avis sur un livre
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  // 1. Vérifier si l'utilisateur est bien connecté via sa session
  if (!username) {
    return res.status(403).json({ message: "Utilisateur non authentifié. Veuillez vous connecter." });
  }

  // 2. Vérifier si le livre existe
  if (!books[isbn]) {
    return res.status(404).json({ message: "Livre non trouvé pour cet ISBN." });
  }

  // 3. Vérifier si l'utilisateur a effectivement un avis enregistré sur ce livre
  if (books[isbn].reviews && books[isbn].reviews[username]) {
    // Supprimer uniquement la clé correspondant à l'utilisateur actuel
    delete books[isbn].reviews[username];
    
    return res.status(200).json({
      message: `L'avis de l'utilisateur '${username}' pour l'ISBN ${isbn} a été supprimé avec succès.`,
      reviews: books[isbn].reviews
    });
  } else {
    return res.status(404).json({ message: `Aucun avis trouvé pour l'utilisateur '${username}' sur cet ISBN.` });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;