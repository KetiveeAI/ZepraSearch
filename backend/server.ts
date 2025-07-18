import express from 'express';
import indexPageRoute from './routes/indexPage';
import searchPagesRoute from './routes/searchPages';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(indexPageRoute);
app.use(searchPagesRoute);

app.get('/', (req, res) => {
  res.send('ZepraSearch API is running.');
});

app.listen(PORT, () => {
  console.log(`ZepraSearch backend running on port ${PORT}`);
});
