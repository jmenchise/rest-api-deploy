const express = require('express');
const crypto = require('node:crypto');
const movies = require('./movies.json');
const { validateMovie, validatePartialMovie } = require('./schemas/movies');

const PORT = process.env.PORT ?? 8080;

const app = express();
app.disable('x-powered-by');
app.use(express.json());

app.get('/movies', (req, res) => {
   res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
   const { genre } = req.query;
   if (genre) {
      const filteredMovies = movies.filter(
         movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      );
      return res.json(filteredMovies);
   }
   res.json(movies);
});

app.get('/movies/:id', (req, res) => {
   const { id } = req.params;
   const movie = movies.find(movie => movie.id === id);
   if (movie) {
      return res.json(movie);
   }
   res.status(404).json({ message: 'Movie Not Found' });
});

app.post('/movies', (req, res) => {
   const result = validateMovie(req.body);
   if (result.error) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
   }
   const newMovie = {
      id: crypto.randomUUID(),
      ...result.data
   };
   movies.push(newMovie);
   res.status(201).json(newMovie);
});

app.patch('/movies/:id', (req, res) => {
   const result = validatePartialMovie(req.body);
   if (result.error) {
      return res.status(400).json({ error: JSON.parse(result.error.message) });
   };
   const { id } = req.params;
   const movieIndex = movies.findIndex(movie => movie.id === id);
   if (movieIndex === -1) {
      return res.status(404).json({ message: 'Movie Not Found' });
   }
   const updatedMovie = {
      ...movies[movieIndex],
      ...result.data
   };
   movies[movieIndex] = updatedMovie;
   res.status(201).json(updatedMovie);
});

app.options('/movies/:id', (req, res, next) => {
   res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
   next();
});

app.delete('/movies/:id', (req, res) => {
   res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
   const { id } = req.params;
   const movieIndex = movies.findIndex(movie => movie.id === id);
   if (movieIndex === -1) {
      return res.status(404).json({ message: 'Movie Not Found' });
   };
   movies.splice(movies[movieIndex], 1);
   res.json({ message: 'Movie deleted!' });
});

app.listen(PORT, () => {
   console.log(`Servidor express escuchando por el puerto http://localhost:${PORT}`);
});
