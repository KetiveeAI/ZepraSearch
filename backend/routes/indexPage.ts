import express from 'express';
import { indexPage } from '../database/elasticsearchManager';

const router = express.Router();

router.post('/index', async (req, res) => {
  try {
    await indexPage(req.body); // expects {url, title, content, crawledAt, metadata}
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
