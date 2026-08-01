/* ============================================================
   Repulse — Search Intelligence
   Understands natural-language queries (Turkish & English),
   extracts the core concepts and expands them into English
   synonyms so the GitHub API returns relevant results from
   repositories in ALL languages — not just Turkish ones.
   ============================================================ */

window.RepulseSearch = (function () {

    // ---------- Diacritics ----------
    const DIACRITICS = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u' };

    function stripDiacritics(s) {
        return s.toLowerCase().replace(/[çğıöşüâîû]/g, ch => DIACRITICS[ch] || ch);
    }

    const TURKISH_CHARS = /[çğıöşüâîû]/i;

    // ---------- Multi-word concepts: Turkish phrase → English terms ----------
    // Matched token-wise, longest phrases first. ASCII keys match both
    // "görüntü işleme" and "goruntu isleme".
    const CONCEPTS = [
        ['yapay zeka', ['artificial intelligence', 'ai', 'machine learning']],
        ['makine ogrenmesi', ['machine learning', 'ml', 'ai']],
        ['derin ogrenme', ['deep learning']],
        ['goruntu isleme', ['image processing', 'computer vision', 'opencv']],
        ['bilgisayar gorusu', ['computer vision', 'image processing']],
        ['dogal dil isleme', ['natural language processing', 'nlp']],
        ['yuz tanima', ['face recognition', 'facial recognition', 'face detection']],
        ['ses tanima', ['speech recognition', 'voice recognition', 'asr']],
        ['yazi tanima', ['ocr', 'optical character recognition']],
        ['siber guvenlik', ['cybersecurity', 'cyber security', 'security']],
        ['etik hackleme', ['ethical hacking', 'penetration testing', 'hacking']],
        ['sifre yoneticisi', ['password manager']],
        ['kimlik dogrulama', ['authentication', 'auth', 'login', 'oauth']],
        ['web sitesi', ['website', 'web application', 'web app']],
        ['web uygulamasi', ['web application', 'web app', 'website']],
        ['web gelistirme', ['web development', 'frontend', 'backend']],
        ['oyun gelistirme', ['game development', 'gamedev', 'unity', 'unreal engine']],
        ['mobil uygulama', ['mobile app', 'android', 'ios', 'flutter', 'react native']],
        ['masaustu uygulama', ['desktop app', 'desktop application', 'electron']],
        ['tarayici uzantisi', ['browser extension', 'chrome extension', 'firefox addon']],
        ['sohbet botu', ['chatbot', 'chat bot', 'chatgpt']],
        ['telegram bot', ['telegram bot', 'telegram']],
        ['discord bot', ['discord bot', 'discord']],
        ['whatsapp bot', ['whatsapp bot', 'whatsapp']],
        ['canli yayin', ['live streaming', 'streaming', 'twitch']],
        ['ekran kaydi', ['screen recording', 'screencast']],
        ['not alma', ['note taking', 'notes', 'notebook']],
        ['gorev yonetimi', ['task management', 'todo', 'kanban', 'project management']],
        ['proje yonetimi', ['project management', 'kanban']],
        ['dosya yonetimi', ['file manager', 'file management']],
        ['veri analizi', ['data analysis', 'data analytics']],
        ['veri bilimi', ['data science']],
        ['veri goruntuleme', ['data visualization', 'dashboard', 'chart']],
        ['buyuk veri', ['big data', 'spark', 'hadoop']],
        ['nesnelerin interneti', ['internet of things', 'iot', 'arduino']],
        ['kripto para', ['cryptocurrency', 'crypto', 'bitcoin']],
        ['blokzincir', ['blockchain', 'web3']],
        ['hisse senedi', ['stock market', 'stocks', 'trading']],
        ['e ticaret', ['ecommerce', 'e-commerce', 'shop']],
        ['isletim sistemi', ['operating system', 'os']],
        ['sanal makine', ['virtual machine', 'vm', 'virtualization']],
        ['arama motoru', ['search engine', 'search', 'elasticsearch']],
        ['kod editoru', ['code editor', 'text editor', 'ide']],
        ['kullanici deneyimi', ['user experience', 'ux']],
        ['surukle birak', ['drag and drop', 'dnd']],
        ['hava durumu', ['weather', 'weather app']],
        ['mesajlasma', ['messaging', 'chat', 'instant messaging']],
        ['e posta', ['email', 'mail', 'smtp']],
        ['canli sohbet', ['live chat', 'chat', 'websocket']],
        ['metin okuma', ['text to speech', 'tts']],
        ['konusma tanima', ['speech recognition', 'voice recognition']],
        ['chat bot', ['chatbot', 'chat bot']],
        ['text to speech', ['text to speech', 'tts']],
        ['yapay zeka asistan', ['ai assistant', 'chatbot', 'copilot']],
        ['acik kaynak', ['open source', 'open-source', 'free software']],
        ['gercek zamanli', ['real time', 'realtime', 'live']],
        ['insansiz hava araci', ['drone', 'uav', 'unmanned aerial vehicle', 'quadcopter']],
        ['hava araci', ['uav', 'aerial vehicle', 'drone']],
        ['klavye fare', ['keyboard mouse', 'kvm', 'usb hid', 'input sharing']],
    ];

    // ---------- Word-level map: leftover Turkish words → English terms ----------
    const WORD_MAP = {
        'gorsel': ['image', 'visual'],
        'goruntu': ['image', 'vision'],
        'ogrenme': ['learning', 'machine learning'],
        'zeka': ['intelligence', 'ai'],
        'guvenlik': ['security'],
        'veri': ['data'],
        'ses': ['audio', 'sound'],
        'metin': ['text'],
        'kod': ['code'],
        'yazi': ['text', 'writing'],
        'sayfa': ['page', 'webpage'],
        'site': ['website'],
        'uygulama': ['app', 'application'],
        'oyun': ['game', 'gaming'],
        'video': ['video'],
        'muzik': ['music', 'audio'],
        'resim': ['image', 'picture'],
        'fotograf': ['photo', 'photography'],
        'cizim': ['drawing', 'sketch'],
        'grafik': ['graph', 'chart', 'plotting'],
        'harita': ['map', 'maps', 'gis'],
        'hava': ['weather'],
        'sifre': ['password'],
        'sohbet': ['chat'],
        'mesaj': ['message'],
        'bildirim': ['notification'],
        'takvim': ['calendar'],
        'not': ['note'],
        'gorev': ['task'],
        'bulut': ['cloud'],
        'ag': ['network'],
        'sunucu': ['server'],
        'tarayici': ['browser'],
        'donanim': ['hardware'],
        'yazilim': ['software'],
        'robot': ['robot', 'robotics'],
        'isleme': ['processing'],
        'tespit': ['detection'],
        'tahmin': ['prediction', 'forecast'],
        'siniflandirma': ['classification'],
        'analiz': ['analysis', 'analytics'],
        'analitik': ['analytics'],
        'rapor': ['report'],
        'otomatik': ['automatic', 'automation'],
        'yardimci': ['assistant', 'helper'],
        'arama': ['search'],
        'okuma': ['reader'],
        'yazma': ['writing'],
        'goruntuleme': ['visualization'],
        'kayit': ['recording'],
        'paylasim': ['sharing'],
        'indirme': ['download'],
        'yukleme': ['upload'],
        'depolama': ['storage'],
        'otomasyon': ['automation'],
        'emulator': ['emulator'],
        'derleyici': ['compiler'],
        'vpn': ['vpn'],
        'proxy': ['proxy'],
        'sensor': ['sensor'],
        'egitim': ['education', 'elearning'],
        'saglik': ['health', 'healthcare'],
        'hukuk': ['law', 'legal'],
        'matematik': ['mathematics', 'math'],
        'fizik': ['physics'],
        'kimya': ['chemistry'],
        'biyoloji': ['biology', 'bioinformatics'],
        'astronomi': ['astronomy', 'space'],
        'istatistik': ['statistics'],
        'sozluk': ['dictionary'],
        'ceviri': ['translation', 'translator'],
        'cevirici': ['translator', 'converter'],
        'asistan': ['assistant', 'virtual assistant', 'chatgpt'],
        'bot': ['bot'],
        'finans': ['finance', 'fintech', 'banking'],
        'ticaret': ['ecommerce', 'e-commerce'],
        'borsa': ['stock market', 'trading'],
        'sifreleme': ['encryption', 'cryptography'],
        'kripto': ['crypto', 'cryptography'],
        'ag': ['network'],
        'api': ['api', 'rest api'],
        'kutuphane': ['library'],
        'arac': ['tool', 'tools'],
        'motor': ['engine'],
        'panel': ['dashboard', 'admin panel'],
        'yonetim': ['management'],
        'takip': ['tracking'],
        'drone': ['drone', 'uav', 'quadcopter'],
        'insansiz': ['uav', 'unmanned', 'drone'],
        'roket': ['rocket', 'rocketry'],
        'uzay': ['space', 'aerospace'],
        'kontrol': ['control', 'controller'],
        'fare': ['mouse', 'cursor', 'pointer'],
        'klavye': ['keyboard'],
        'ekran': ['screen', 'display', 'monitor'],
        'kamera': ['camera', 'webcam'],
        'mikrofon': ['microphone', 'mic'],
        'bilgisayar': ['computer', 'pc', 'desktop'],
        'telefon': ['phone', 'mobile', 'smartphone'],
    };

    // Turkish possessive/plural suffixes — stripped so "kütüphanesi", "kütüphaneleri"
    // resolve to their dictionary form ("kutuphane")
    const SUFFIXES = [
        'leri', 'larin', 'lerin', 'lar', 'ler', 'sinin', 'nin', 'nun',
        'in', 'un', 'den', 'dan', 'de', 'da', 'ye', 'ya', 'e', 'a',
        'li', 'lu', 'ci', 'cu', 'si', 'su', 'i', 'u',
    ];

    function lookupWord(token) {
        if (WORD_MAP[token]) return WORD_MAP[token];
        for (const sfx of SUFFIXES) {
            if (token.length - sfx.length >= 3 && token.endsWith(sfx)) {
                const found = lookupWord(token.slice(0, token.length - sfx.length));
                if (found) return found;
            }
        }
        return null;
    }

    // ---------- Fillers / stop words ----------
    const FILLER_TR = [
        'bana', 'bana bir', 'bir', 've', 'ile', 'icin', 'bu', 'su', 'o', 'lazim', 'lazimmis',
        'gerekli', 'gereken', 'gerek', 'istiyorum', 'istiyordum', 'ariyorum', 'olsin', 'olsun',
        'olan', 'yapan', 'yapabilen', 'yapilmis', 'yapilan', 'saglayan', 'iceren', 'destekleyen',
        'destekleyebilen', 'uzerine', 'uzere', 'seklinde', 'gibi', 'var', 'mi', 'mu', 'bul',
        'getir', 'goster', 'listele', 'repo', 'repolar', 'repoyu', 'repository', 'repositorysi',
        'proje', 'projeler', 'projesi', 'kullanan', 'kullanarak', 'kullanabilen',
        'calisan', 'yapmak', 'yapma', 'yapan bir', 'hazirlayan', 'hazirlayan bir', 'sunan',
        'kullanmak', 'isteyen', 'isteyene', 'kadar', 'icin uygun', 'uygun', 'harika', 'guzel',
        'istedigim', 'istedigim bir', 'benim', 'benim icin', 'ornek', 'ornekler', 'basit',
        'kolay', 'hizli', 'gelismis', 'ama', 'veya', 'fakat', 'falan', 'hem', 'de', 'da',
        'ayrica', 'baska', 'diger', 'kendi', 'kendine', 'ilgili', 'ilgilenen', 'hakkinda',
        'birlikte', 'tarafindan', 'icin yapilmis',
    ];

    const FILLER_EN = [
        'i', 'need', 'a', 'an', 'that', 'which', 'can', 'could', 'does', 'do', 'for', 'looking',
        'look', 'like', 'something', 'similar', 'such', 'as', 'make', 'makes', 'making', 'create',
        'creates', 'creating', 'with', 'and', 'or', 'is', 'are', 'want', 'wanted', 'find', 'found',
        'search', 'me', 'please', 'repo', 'repository', 'repos', 'repositories', 'project',
        'projects', 'app', 'application', 'about', 'should', 'would', 'built', 'based', 'using',
        'tool', 'tools', 'library', 'libraries', 'framework', 'list', 'show', 'nice', 'good',
        'best', 'awesome', 'simple', 'easy', 'fast', 'small', 'big', 'new', 'old',
        'my', 'your', 'his', 'her', 'their', 'our', 'us', 'we', 'you', 'it', 'they', 'this',
        'those', 'these', 'there', 'here', 'also', 'too', 'just', 'even', 'still', 'more',
        'most', 'some', 'any', 'one', 'every', 'each',
    ];

    const FILLER = new Set([...FILLER_TR, ...FILLER_EN]);

    // ---------- Helpers ----------
    function extractQuoted(input) {
        const matches = [...input.matchAll(/"([^"]+)"/g)];
        return matches.map(m => m[1].trim()).filter(Boolean);
    }

    function removeQuoted(input) {
        return input.replace(/"([^"]+)"/g, ' ');
    }

    function isTurkishText(text) {
        if (TURKISH_CHARS.test(text)) return true;
        const norm = stripDiacritics(text);
        const tokens = norm.split(/\s+/).filter(Boolean);
        for (const f of FILLER_TR) {
            const filler = stripDiacritics(f);
            if (filler.includes(' ')) {
                if (norm.includes(filler)) return true;
            } else if (tokens.includes(filler)) {
                return true;
            }
        }
        return false;
    }

    function matchConcepts(tokens) {
        const found = [];
        const consumed = new Set();
        const sorted = CONCEPTS.slice().sort((a, b) => {
            return b[0].split(/\s+/).length - a[0].split(/\s+/).length;
        });

        for (const [phrase, terms] of sorted) {
            const pTokens = phrase.split(/\s+/);
            for (let i = 0; i <= tokens.length - pTokens.length; i++) {
                if (consumed.has(i)) continue;
                let match = true;
                for (let j = 0; j < pTokens.length; j++) {
                    if (tokens[i + j] !== pTokens[j]) { match = false; break; }
                }
                if (match) {
                    for (let j = 0; j < pTokens.length; j++) consumed.add(i + j);
                    found.push({ phrase, terms });
                    break;
                }
            }
        }

        const remaining = tokens.filter((t, i) => !consumed.has(i));
        return { found, remaining };
    }

    function quoteIfNeeded(term) {
        return /\s/.test(term) ? `"${term}"` : term;
    }

    function sanitizeToken(token) {
        if (token.includes(':')) return null; // strip GitHub operators
        if (token === 'in' || token === 'or' || token === 'and' || token === 'not') return null;
        return token;
    }

    // ---------- Main ----------
    function understandQuery(input) {
        const raw = String(input || '').trim();
        if (!raw) return null;

        const quoted = extractQuoted(raw);
        const withoutQuotes = removeQuoted(raw);
        const tokens = stripDiacritics(withoutQuotes).toLowerCase()
            .split(/\s+/)
            .map(sanitizeToken)
            .filter(t => t && t.length > 1);

        const { found, remaining } = matchConcepts(tokens);

        const isTurkish = isTurkishText(withoutQuotes.toLowerCase());

        const groups = quoted.map(q => [q]);
        const plain = [];
        let unknownTurkish = [];

        for (const concept of found) {
            groups.push(concept.terms);
        }

        for (const token of remaining) {
            if (FILLER.has(token)) continue;
            const mapped = lookupWord(token);
            if (mapped) {
                groups.push(mapped);
                continue;
            }
            if (isTurkish) {
                // Keep unknown words in the query — Turkish loanwords like
                // "drone" or "api" are still what GitHub repos are named with.
                unknownTurkish.push(token);
                plain.push(token);
                continue;
            }
            plain.push(token);
        }

        // Fallback: nothing meaningful found → use raw non-filler tokens
        if (groups.length === 0 && plain.length === 0) {
            const rawTerms = tokens.filter(t => !FILLER.has(t));
            if (rawTerms.length > 0) {
                return { query: rawTerms.join(' '), groups: rawTerms.map(t => [t]), isTurkish, raw };
            }
            return { query: raw, groups: [], isTurkish, raw };
        }

        const query = [
            ...groups.map(g => `(${g.map(quoteIfNeeded).join(' OR ')})`),
            ...plain
        ].join(' ');

        return { query, groups, plain, isTurkish, raw, unknownTurkish };
    }

    return { understandQuery, stripDiacritics, isTurkishText };
})();
