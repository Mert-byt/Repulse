const express = require('express');
const cors = require('cors');
const path = require('path');
const { findRepo } = require('./src/finder');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for searching repos (POST - Legacy)
app.post('/api/search', async (req, res) => {
  try {
    const { query, sort, order } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Arama terimi gerekli' });
    }

    const repos = await findRepo(query, { sort, order });

    if (!repos || repos.length === 0) {
      return res.json({ repos: [], message: 'Sonuç bulunamadı' });
    }

    res.json({ repos, message: 'Başarılı' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Arama sırasında bir hata oluştu' });
  }
});

// API endpoint for searching repos (GET - New with Pagination)
app.get('/api/search', async (req, res) => {
  try {
    const { q, sort = 'stars', order = 'desc', page = 1 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Arama terimi gerekli', items: [] });
    }

    const repos = await findRepo(q, { sort, order, page: parseInt(page) });

    // Return in GitHub API compatible format
    res.json({
      items: repos || [],
      total_count: repos ? repos.length : 0,
      message: repos && repos.length > 0 ? 'Başarılı' : 'Sonuç bulunamadı'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Arama sırasında bir hata oluştu', items: [] });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});

