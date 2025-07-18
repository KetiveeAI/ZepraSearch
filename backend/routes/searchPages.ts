import express from 'express';
import { searchPages } from '../database/elasticsearchManager';

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const results = await searchPages(q as string);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
