import express from 'express';
import mysql2 from 'mysql2/promise';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import cookie from 'cookie-parser';
import nodeMailer from 'nodemailer';
import session from 'express-session';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['POST', 'GET', 'DELETE', 'PUT'],
    credentials: true
}));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: false,
        sameSite: 'strict'
    }
}));

app.use((req, res, next) => {
    res.locals.session = req.session.user;
    next();
});

app.use(cookie());

const apiRouter = express.Router();

const verifyUser = (req, res, next) => {
    const user = req.session.user;

    if (!user || !user.role) {
        return res.json({});
    }

    if (!user || !user.id) {
        return res.json({});
    } else {
        req.id = user.id;
        req.role = user.role;
        req.jmeno = user.jmeno;
        req.prijmeni = user.prijmeni;
        next();
    }
}

app.use('/api', apiRouter);

app.use(express.static(path.join(__dirname, 'build')));

app.use("/uploads", express.static(path.join(__dirname, 'uploads')));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const db = mysql2.createPool({
    host: process.env.MYSQL_ADDON_HOST,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB,
    port: process.env.MYSQL_ADDON_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

db.query('SELECT 1')
  .then(() => console.log('✅ Připojeno k databázi'))
  .catch(err => console.error('❌ Chyba při připojení k databázi:', err));

apiRouter.get('/user/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [userData] = await db.query(
            'SELECT uzivatel.id, uzivatel.jmeno, uzivatel.prijmeni, uzivatel.email, uzivatel.telefon, uzivatel.kraj, uzivatel.mesto, uzivatel.role FROM uzivatel WHERE id = ?',
            [id]
        );

        return res.json({ Status: 'Success', result: userData });
    } catch (error) {
        console.error('Chyba při získávání počtu notifikací:', error);
        return res.json({ Error: 'Chyba při získávání počtu notifikací.' });
    }
})

apiRouter.post('/createChat', verifyUser, async (req, res) => {
    const { userId } = req.body;  // ID druhého uživatele (vlastník inzerátu)
    const curId = req.id; // Přihlášený uživatel

    if (!userId || userId === curId) {
        return res.json({ Status: "Error", Error: "Neplatný uživatel" });
    }

    const sqlCheck = `
        SELECT id FROM konverzace 
        WHERE (fk_uzivatel1 = ? AND fk_uzivatel2 = ?) 
        OR (fk_uzivatel1 = ? AND fk_uzivatel2 = ?)
    `;

    try {
        // Ověříme, zda již konverzace existuje
        const [result] = await db.query(sqlCheck, [curId, userId, userId, curId]);

        if (result.length > 0) {
            return res.json({ Status: "Exists", ChatId: result[0].id });
        }

        // Pokud konverzace neexistuje, vytvoříme novou
        const sqlInsert = `
            INSERT INTO konverzace (fk_uzivatel1, fk_uzivatel2) VALUES (?, ?)
        `;

        const [insertResult] = await db.query(sqlInsert, [curId, userId]);

        return res.json({ Status: "Success", ChatId: insertResult.insertId });

    } catch (err) {
        console.error('Chyba při ověřování chatu:', err);
        return res.json({ Status: "Error", Error: "Chyba při ověřování chatu." });
    }
});


apiRouter.get('/recenze/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [recenze] = await db.query(
            'SELECT uzivatel.jmeno, uzivatel.prijmeni, hodnoceni.hodnoceni, hodnoceni.komentar, hodnoceni.datum_vytvoreni FROM hodnoceni JOIN uzivatel ON fk_uzivatel_hodnotici = uzivatel.id WHERE fk_uzivatel_hodnoceny = ?  ORDER BY hodnoceni.datum_vytvoreni DESC',
            [id]
        );

        return res.json({ Status: 'Success', result: recenze });
    } catch (error) {
        console.error('Chyba při získávání počtu notifikací:', error);
        return res.json({ Error: 'Chyba při získávání počtu notifikací.' });
    }
})

apiRouter.post('/zpravy/:id', verifyUser, async (req, res) => {
    const { id } = req.params;
    const { obsah } = req.body;
    const userId = req.id;

    try {
        const [insertResult] = await db.query(
            `INSERT INTO zprava (fk_konverzace, fk_uzivatel, obsah, datum_odeslani) 
             VALUES (?, ?, ?, NOW())`,
            [id, userId, obsah]
        );

        return res.json({ Status: 'Success' });
    } catch (error) {
        console.error('Chyba při odesílání zprávy:', error);
        return res.json({ Status: 'Error', message: 'Chyba při odesílání zprávy.' });
    }
});


apiRouter.get('/zpravy/:id', verifyUser, async (req, res) => {
    const { id } = req.params;
    const userId = req.id;
    try {
        const [zpravy] = await db.query(
            `SELECT zprava.id, zprava.obsah, zprava.datum_odeslani, 
            uzivatel.jmeno AS odesilatel_jmeno, uzivatel.prijmeni AS odesilatel_prijmeni
            FROM zprava
            JOIN uzivatel ON zprava.fk_uzivatel = uzivatel.id
            WHERE fk_konverzace = ?
            ORDER BY datum_odeslani ASC`,
            [id]
        );

        return res.json({ Status: 'Success', result: zpravy, id: userId });
    } catch (error) {
        console.error('Chyba při získávání zpráv:', error);
        return res.json({ Error: 'Chyba při získávání zpráv.' });
    }
});


apiRouter.get('/recenzeUzivatele/:id', verifyUser, async (req, res) => {
    const { id } = req.params;
    const userId = req.id;
    try {
        const [recenze] = await db.query(
            'SELECT * FROM hodnoceni WHERE fk_uzivatel_hodnoceny = ? AND fk_uzivatel_hodnotici = ?',
            [id, userId]
        );

        if (recenze.length > 0) {
            return res.json({ Status: 'Success', result: recenze })
        }

        return res.json({ Status: 'Failed' });
    } catch (error) {
        console.error('Chyba při získávání počtu notifikací:', error);
        return res.json({ Error: 'Chyba při získávání počtu notifikací.' });
    }
})

apiRouter.post('/recenze/:id', verifyUser, async (req, res) => {
    const { id } = req.params;
    const userId = req.id;
    const { stars, comment } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO hodnoceni (fk_uzivatel_hodnoceny, fk_uzivatel_hodnotici, hodnoceni, komentar, datum_vytvoreni) VALUES (?, ?, ?, ?, NOW())',
            [id, userId, stars, comment]
        );

        return res.json({ Status: 'Success', id: result.insertId });
    } catch (error) {
        console.error('Chyba při přidávání hodnocení:', error);
        return res.json({ Error: 'Chyba při přidávání hodnocení.' });
    }
});


apiRouter.put('/recenze/:id', verifyUser, async (req, res) => {
    const { id } = req.params;
    const userId = req.id;
    const { stars, comment } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE hodnoceni SET hodnoceni = ?, komentar = ?, datum_vytvoreni = NOW() WHERE fk_uzivatel_hodnoceny = ? AND fk_uzivatel_hodnotici = ?',
            [stars, comment, id, userId]
        );

        if (result.affectedRows === 0) {
            return res.json({ Error: 'Hodnocení nenalezeno.' });
        }

        return res.json({ Status: 'Success' });
    } catch (error) {
        console.error('Chyba při aktualizaci hodnocení:', error);
        return res.status(500).json({ Error: 'Chyba při aktualizaci hodnocení.' });
    }
});


apiRouter.put('/recenze/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [recenze] = await db.query(
            'UPDATE hodnoceni.hodnoceni, hodnoceni.komentar, hodnoceni.datum_vytvoreni FROM hodnoceni WHERE fk_uzivatel_hodnoceny = ?',
            [id]
        );

        return res.json({ Status: 'Success', result: recenze });
    } catch (error) {
        console.error('Chyba při získávání počtu notifikací:', error);
        return res.json({ Error: 'Chyba při získávání počtu notifikací.' });
    }
})

apiRouter.get('/pocetNote', verifyUser, async (req, res) => {
    const userId = req.id;
    try {
        const [rows] = await db.query(
            'SELECT COUNT(*) AS count FROM notifikace WHERE fk_uzivatel = ? AND precteno = FALSE',
            [userId]
        );

        const count = rows[0].count;

        return res.json({ Status: 'Success', count: count });
    } catch (error) {
        console.error('Chyba při získávání počtu notifikací:', error);
        return res.json({ Error: 'Chyba při získávání počtu notifikací.' });
    }
})

//Požadavek na kontrolu přihlášení
apiRouter.get('/check', verifyUser, (req, res) => {
    return res.json({ Status: 'Success', role: req.role, id: req.id, jmeno: req.jmeno, prijmeni: req.prijmeni })
});

apiRouter.delete('/user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        await db.query('DELETE FROM oblibene WHERE fk_uzivatel = ?', [userId]);

        const ads = await db.query('SELECT id, fk_auto FROM inzerat WHERE fk_uzivatel = ?', [userId]);

        if (ads[0].length > 0) {
            for (const ad of ads[0]) {
                const adId = ad.id;
                const carId = ad.fk_auto;

                await db.query('DELETE FROM oblibene WHERE fk_inzerat = ?', [adId]);

                await db.query('DELETE FROM obrazky WHERE fk_inzerat = ?', [adId]);

                // Smazání inzerátu
                await db.query('DELETE FROM inzerat WHERE id = ?', [adId]);

                // Smazání auta
                await db.query('DELETE FROM auto WHERE id = ?', [carId]);
            }
        }

        await db.query('DELETE FROM uzivatel WHERE id = ?', [userId]);

        return res.json({ Status: 'Success' });
    } catch (error) {
        console.error('Chyba při mazání uživatele:', error);
        return res.json({ Error: 'Chyba při mazání uživatele.' });
    }
});

apiRouter.get('/konverzace/:id/uzivatele', verifyUser, async (req, res) => {
    const { id } = req.params;
    const userId = req.id;

    try {
        const [konverzaceRows] = await db.query(
            'SELECT * FROM konverzace WHERE id = ? AND (fk_uzivatel1 = ? OR fk_uzivatel2 = ?)',
            [id, userId, userId]
        );

        if (konverzaceRows.length === 0) {
            return res.json({ Status: "Error" });
        }

        const konverzace = konverzaceRows[0];

        const druhyUzivatelId = konverzace.fk_uzivatel1 === userId ? konverzace.fk_uzivatel2 : konverzace.fk_uzivatel1;

        const [uzivatelRows] = await db.query(
            'SELECT id, jmeno, prijmeni FROM uzivatel WHERE id = ?',
            [druhyUzivatelId]
        );

        if (uzivatelRows.length === 0) {
            return res.json({ Status: "Error" });
        }

        const druhy = uzivatelRows[0];

        return res.json({
            Status: "Success",
            druhyUzivatelId: druhy.id,
            jmenoUzivatele: `${druhy.jmeno}`
        });
    } catch (error) {
        console.error(error);
        res.json({ Status: "Error" });
    }
});


apiRouter.post('/user/:id/role', async (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;
    const sql = 'UPDATE uzivatel SET role = ? WHERE id = ?';
    try {
        await db.query(sql, [role, userId]);
        return res.json({ Status: 'Success' });
    } catch (error) {
        return res.json({ Error: 'Chyba při změně role uživatele.' });
    }
});

apiRouter.get('/userList', verifyUser, async (req, res) => {
    const currentUserId = req.id;
    const sql = 'SELECT uzivatel.id, uzivatel.jmeno, uzivatel.prijmeni, uzivatel.email, uzivatel.telefon, uzivatel.role, uzivatel.datum_registrace FROM uzivatel WHERE uzivatel.id != ?;';
    try {
        const [users] = await db.query(sql, [currentUserId]);

        if (users.length === 0) {
            return;
        }

        return res.json({ Status: "Success", users });
    } catch (err) {

    }
})

apiRouter.get('/adList', verifyUser, async (req, res) => {

    const sql = `
      SELECT 
        inzerat.id,
        inzerat.fk_auto, 
        inzerat.nazev, 
        inzerat.stav,
        inzerat.datum_vytvoreni,
        inzerat.datum_aktualizace, 
        uzivatel.jmeno, 
        uzivatel.prijmeni, 
        uzivatel.email,
        obrazky.obrazek 
      FROM inzerat
      JOIN uzivatel ON inzerat.fk_uzivatel = uzivatel.id
      JOIN obrazky ON inzerat.id = obrazky.fk_inzerat
      WHERE obrazky.hlavni = true
      ;
    `;
    try {
        const [ads] = await db.query(sql);

        if (ads.length === 0) {
            return res.json({ Status: "Error", Error: "Žádné inzeráty nebyly nalezeny." });
        }

        return res.json({ Status: "Success", ads });
    } catch (err) {
        console.error('Chyba při načítání inzerátů:', err);
        return res.json({ Status: "Error", Error: "Došlo k chybě při načítání inzerátů." });
    }
});

apiRouter.post('/add', verifyUser, upload.array('images'), async (req, res) => {
    const userId = req.id;
    try {
        const inzerat = JSON.parse(req.body.inzerat);
        const auto = JSON.parse(req.body.auto);
        const specifikace = JSON.parse(req.body.specifikace);

        const [znacka] = await db.query('SELECT id FROM znacka WHERE nazev = ?', [auto.znacka]);
        let znackaId;
        if (znacka.length === 0) {
            const [result] = await db.query('INSERT INTO znacka (nazev) VALUES (?)', [auto.znacka]);
            znackaId = result.insertId;
        } else {
            znackaId = znacka[0].id;
        }

        const [model] = await db.query('SELECT id FROM model WHERE nazev = ? AND fk_znacka = ?', [auto.model, znackaId]);
        let modelId;
        if (model.length === 0) {
            const [result] = await db.query('INSERT INTO model (nazev, fk_znacka) VALUES (?, ?)', [auto.model, znackaId]);
            modelId = result.insertId;
        } else {
            modelId = model[0].id;
        }

        const [autoResult] = await db.query(
            `INSERT INTO auto (fk_model, rok_vyroby, vykon_kw, palivo, karoserie, barva, najete_km, objem, pohon, prevodovka, vin, pocet_sedadel, pocet_dveri)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [modelId, specifikace.rokVyroby, specifikace.vykon, specifikace.palivo, auto.karoserie, specifikace.barva, specifikace.najeto, specifikace.objem, specifikace.pohon, specifikace.prevodovka, specifikace.vin, auto.pocetSedadel, auto.pocetDveri]
        );
        const autoId = autoResult.insertId;

        const [inzeratSQL] = await db.query(
            `INSERT INTO inzerat (nazev, cena, popis, fk_auto, fk_uzivatel)
             VALUES (?, ?, ?, ?, ?)`,
            [inzerat.nazev, inzerat.cena, inzerat.popis, autoId, userId]
        );
        const inzeratId = inzeratSQL.insertId;

        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map((file, index) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'car-ads',
                        },
                        async (error, result) => {
                            if (error) reject(error);
                            else {
                                try {
                                    await db.query(
                                        'INSERT INTO obrazky (fk_inzerat, obrazek, hlavni) VALUES (?, ?, ?)',
                                        [inzeratId, result.secure_url, index === 0]
                                    );
                                    resolve(result);
                                } catch (err) {
                                    reject(err);
                                }
                            }
                        }
                    );

                    const bufferStream = new Readable();
                    bufferStream.push(file.buffer);
                    bufferStream.push(null);
                    bufferStream.pipe(uploadStream);
                });
            });

            await Promise.all(uploadPromises);
        }

        return res.json({ Status: 'Success' });
    } catch (err) {
        console.error('Error:', err);
        return res.json({ Error: "Nastala chyba při zpracování registrace." + err });
    }
});

//Požadavek na registraci
apiRouter.post('/registrace', async (req, res) => {
    try {
        const checkPhoneNumberSql = "SELECT * FROM uzivatel WHERE telefon = ?";
        const [phoneResult] = await db.query(checkPhoneNumberSql, [req.body.celyTelefon]);
        if (phoneResult.length > 0) {
            return res.json({ Error: "Tento telefon je již zaregistrován." });
        }

        const checkEmailSql = "SELECT * FROM uzivatel WHERE email = ?";
        const [emailResult] = await db.query(checkEmailSql, [req.body.email]);
        if (emailResult.length > 0) {
            return res.json({ Error: "Tento e-mail je již zaregistrován." });
        }

        const hashedPassword = await bcryptjs.hash(req.body.heslo.toString(), 10);

        const sql = "INSERT INTO uzivatel (`jmeno`, `prijmeni`, `email`, `telefon`, `heslo`, `kraj`, `mesto`) VALUES (?, ?, ?, ?, ?, ?, ?)";

        const values = [
            req.body.jmeno,
            req.body.prijmeni,
            req.body.email,
            req.body.celyTelefon,
            hashedPassword,
            req.body.kraj,
            req.body.mesto
        ];

        await db.query(sql, values);

        return res.json({ Status: "Success" });

    } catch (err) {
        return res.json({ Error: "Nastala chyba při zpracování registrace." });
    }
});

// Přidání inzerátu do oblíbených
apiRouter.post('/favor', verifyUser, async (req, res) => {
    const id = req.id;
    const { carId, cena } = req.body;
    const sql = 'INSERT INTO oblibene (`fk_uzivatel`, `fk_inzerat`, `cenaPriUlozeni`) VALUES (?, ?, ?)';
    try {
        await db.query(sql, [id, carId, cena]);
        await db.query('UPDATE inzerat SET pocet_oblibenych = pocet_oblibenych + 1 WHERE id = ?', [carId]);
        res.json({ Status: 'Success' });
    }
    catch (err) {
        res.json({ Error: 'Nastala chyba při přidání auta do oblíbených.' })
    }
})

//odebrání inzerátu z oblíbených
apiRouter.delete('/favor/:carId', verifyUser, async (req, res) => {
    const id = req.id;
    const { carId } = req.params;
    const sql = 'DELETE FROM oblibene WHERE fk_uzivatel = ? AND fk_inzerat = ?';
    try {
        await db.query(sql, [id, carId]);
        await db.query('UPDATE inzerat SET pocet_oblibenych = GREATEST(pocet_oblibenych - 1, 0) WHERE id = ?', [carId]);
        res.json({ Status: 'Success' });
    } catch (err) {
        res.json({ Error: 'Nepodařilo se odebrat auto z oblíbených.' });
    }
});

//Získání oblíbených inzerátů (Kvůli zobrazení srdce když uživatel hledá vozidla)
apiRouter.get('/favor', verifyUser, async (req, res) => {
    const id = req.id;
    const sql = 'SELECT fk_inzerat FROM oblibene WHERE fk_uzivatel = ?';
    try {
        const [favourites] = await db.query(sql, [id]);
        res.json({ Status: 'Success', favourites });
    } catch (err) {
        console.error(err);
        res.json({ Error: 'Nepodařilo se načíst oblíbená auta.' });
    }
});

//Získaní oblíbených inzerátů (Kvůli zobrazení srdce na samostatném inzerátu)
apiRouter.get('/singleFavourite/:carId', verifyUser, async (req, res) => {
    const id = req.id;
    const { carId } = req.params;
    const sql = 'SELECT 1 FROM oblibene WHERE fk_uzivatel = ? AND fk_inzerat = ? LIMIT 1';

    try {
        const [rows] = await db.query(sql, [id, carId]);

        if (rows.length > 0) {
            return res.json({ Status: "Success" });
        } else {
            return res.json({ Status: "Not Found" });
        }
    } catch (err) {
        console.error("Chyba při kontrole oblíbeného inzerátu:", err);
        res.json({ Error: 'Nastala chyba při kontrole oblíbeného inzerátu.' });
    }
});

//Získání oblíbených inzerátů (Pro zobrazení na stránce oblíbených)
apiRouter.get('/favourites', verifyUser, async (req, res) => {
    const id = req.id;
    const sql = `
        SELECT 
        inzerat.id, 
        inzerat.nazev, 
        inzerat.cena, 
        inzerat.stav, 
        auto.najete_km, 
        auto.rok_vyroby, 
        auto.vykon_kw, 
        auto.palivo, 
        auto.karoserie, 
        auto.prevodovka, 
        uzivatel.kraj, 
        obrazky.obrazek,
        oblibene.cenaPriUlozeni,
        oblibene.datum_pridani 
    FROM 
        inzerat 
    JOIN 
        auto ON inzerat.fk_auto = auto.id 
    JOIN 
        uzivatel ON inzerat.fk_uzivatel = uzivatel.id 
    JOIN 
        obrazky ON inzerat.id = obrazky.fk_inzerat 
    JOIN
        oblibene ON inzerat.id = oblibene.fk_inzerat
    WHERE 
        obrazky.hlavni = true AND oblibene.fk_uzivatel = ?;
    `;

    try {
        const [cars] = await db.query(sql, [id]);

        if (cars.length === 0) {
            return;
        }

        return res.json({ Status: "Success", cars });
    } catch (err) {
        return res.json({ Error: "Nastala chyba při zpracování oblíbených aut." });
    }
})

//Požadavek na přihlášení
apiRouter.post('/prihlaseni', async (req, res) => {
    try {
        const sql = 'SELECT * FROM uzivatel WHERE email = ?';

        const [userData] = await db.query(sql, [req.body.email]);

        if (userData.length === 0) {
            return res.json({ Error: "Tento email není registrován" });
        }

        const user = userData[0];

        const passwordMatch = await bcryptjs.compare(req.body.heslo.toString(), user.heslo);
        if (!passwordMatch) {
            return res.json({ Error: "Hesla se neshodují" });
        }

        req.session.user = { id: user.id, role: user.role, jmeno: user.jmeno, prijmeni: user.prijmeni }

        return res.json({ Status: 'Success' });
    } catch (err) {
        return res.json({ Error: "Nastala chyba při zpracování přihlášení." });
    }
});

//Požadavek na odeslání emailu pro změnu hesla
apiRouter.post('/resetPassword', async (req, res) => {
    try {
        const sql = 'SELECT * FROM uzivatel WHERE email = ?';
        const [userData] = await db.query(sql, [req.body.email]);

        if (userData.length === 0) {
            return res.json({ Error: "Tento email není registrován." });
        }

        const user = userData[0];

        const token = jwt.sign({ id: user.id }, "tajnyKlic", { expiresIn: '10m' });

        res.cookie('reset', token, {
            httpOnly: true,
            secure: false
        });

        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sportovniautainfo@gmail.com',
                pass: 'miueewvorsmlnrmk'
            }
        });

        const mailOptions = {
            from: 'sportovniautainfo@gmail.com',
            to: req.body.email,
            subject: 'Resetování hesla',
            text: `Odkaz je platný po dobu 10 minut: ${process.env.CLIENT_URL}restorePassword/${token}`
        };

        await transporter.sendMail(mailOptions);

        return res.json({ Status: 'Success' });
    } catch (err) {
        return res.json({ Error: "Nastala chyba při zpracování požadavku." });
    }
})

//Požadavek na obnovení hesla
apiRouter.post('/restorePassword/:token', async (req, res) => {
    const { token } = req.params;
    const { heslo } = req.body;

    try {
        const decoded = jwt.verify(token, "tajnyKlic");

        if (!decoded) {
            return res.json({ Error: "Neplatný nebo vypršený token." });
        }

        const userId = decoded.id;

        const hash = await bcryptjs.hash(heslo, 10);

        const sqlChange = 'UPDATE uzivatel SET heslo = ? WHERE id = ?';
        const [result] = await db.query(sqlChange, [hash, userId]);

        if (result.affectedRows > 0) {
            res.clearCookie('reset');
            return res.json({ Status: "Success" });
        } else {
            return res.json({ Error: "Uživatel s tímto ID nebyl nalezen." });
        }
    } catch (err) {
        return res.json({ Error: "Nastala chyba při zpracování požadavku." });
    }
});

//Požadavek na data o uživateli
apiRouter.get('/profile', verifyUser, async (req, res) => {
    const id = req.id;
    const sql = 'SELECT id, jmeno, prijmeni, email, telefon, kraj, mesto, role FROM uzivatel WHERE id = ?';

    try {
        const [result] = await db.query(sql, [id]);

        if (result.length > 0) {
            return res.json({
                Status: 'Success',
                id: result[0].id,
                jmeno: result[0].jmeno,
                prijmeni: result[0].prijmeni,
                email: result[0].email,
                telefon: result[0].telefon,
                kraj: result[0].kraj,
                mesto: result[0].mesto,
                role: result[0].role
            });
        } else {
            return res.json({ Error: 'Uživatel neexistuje.' });
        }
    } catch (err) {
        return res.json({ Error: 'Chyba při načítání profilu.' });
    }
});

//Požadavek na data o inzerátu
apiRouter.get('/car/:id', async (req, res) => {
    const id = req.params.id;

    const sql = `
        SELECT 
            inzerat.id, 
            inzerat.nazev AS inzerat_nazev, 
            inzerat.cena, 
            inzerat.stav, 
            inzerat.popis,
            inzerat.pocet_zobrazeni,
            inzerat.pocet_oblibenych, 
            znacka.nazev AS znacka_nazev, 
            model.nazev AS model_nazev, 
            auto.najete_km, 
            auto.rok_vyroby, 
            auto.vykon_kw, 
            auto.palivo, 
            auto.karoserie, 
            auto.prevodovka, 
            auto.barva, 
            auto.objem, 
            auto.pohon, 
            auto.pocet_sedadel, 
            auto.pocet_dveri, 
            auto.vin,
            uzivatel.id AS userId, 
            uzivatel.kraj, 
            uzivatel.jmeno, 
            uzivatel.prijmeni, 
            uzivatel.mesto, 
            uzivatel.telefon, 
            uzivatel.email, 
            GROUP_CONCAT(obrazky.obrazek ORDER BY obrazky.hlavni DESC SEPARATOR ',') AS obrazky
        FROM 
            inzerat 
        JOIN 
            auto ON inzerat.fk_auto = auto.id 
        JOIN 
            uzivatel ON inzerat.fk_uzivatel = uzivatel.id 
        JOIN 
            model ON auto.fk_model = model.id 
        JOIN 
            znacka ON model.fk_znacka = znacka.id 
        JOIN 
            obrazky ON inzerat.id = obrazky.fk_inzerat 
        WHERE 
            inzerat.id = ?
        GROUP BY 
            inzerat.id`
        ;

    try {
        const [result] = await db.query(sql, [id]);

        if (result.length > 0) {
            const car = result[0];
            if (car.obrazky) {
                car.obrazky = car.obrazky.split(',').map(img => img);
            }
            return res.json({ result: car, Status: "Success" });
        } else {
            return res.json({ Error: 'Auto neexistuje' });
        }
    } catch (error) {
        return res.json({ Error: 'Chyba při načítání auta.' });
    }
});

//Požadavek na změnu údajů
apiRouter.post('/profile', verifyUser, async (req, res) => {
    const id = req.id;
    try {
        if (req.body.isSamePhone === false) {
            const [phoneResult] = await db.query("SELECT * FROM uzivatel WHERE telefon = ?", [req.body.editData.telefon]);
            if (phoneResult.length > 0) {
                return res.json({ Error: "Tento telefon je již zaregistrován" });
            }
        }

        if (req.body.isSameEmail === false) {
            const [emailResult] = await db.query("SELECT * FROM uzivatel WHERE email = ?", [req.body.editData.email]);
            if (emailResult.length > 0) {
                return res.json({ Error: "Tento e-mail je již zaregistrován" });
            }
        }

        const sql = `UPDATE uzivatel SET jmeno = ?, prijmeni = ?, email = ?, telefon = ?, kraj = ?, mesto = ? WHERE id = ?`;
        const values = [
            req.body.editData.jmeno,
            req.body.editData.prijmeni,
            req.body.editData.email,
            req.body.editData.telefon,
            req.body.editData.kraj,
            req.body.editData.mesto,
            id
        ];
        await db.query(sql, values);
        return res.json({ Status: "Success" });
    } catch (err) {
        return res.json({ Error: "Nastala chyba při zpracování požadavku." });
    }
});

apiRouter.get('/chats', verifyUser, async (req, res) => {
    const id = req.id;
    const sql = `
        SELECT 
            k.id AS konverzace_id,
            u1.id AS uzivatel1_id, u1.jmeno AS uzivatel1_jmeno, u1.prijmeni AS uzivatel1_prijmeni,
            u2.id AS uzivatel2_id, u2.jmeno AS uzivatel2_jmeno, u2.prijmeni AS uzivatel2_prijmeni,
            k.datum_zalozeni
        FROM konverzace k
        JOIN uzivatel u1 ON k.fk_uzivatel1 = u1.id
        JOIN uzivatel u2 ON k.fk_uzivatel2 = u2.id
        WHERE k.fk_uzivatel1 = ? OR k.fk_uzivatel2 = ?;
    `;
    try {
        const [chats] = await db.query(sql, [id, id]);

        return res.json({ Status: "Success", id, chats });
    } catch (err) {
        return res.json({ Status: "Error", Error: err });
    }
})

apiRouter.get('/notifications', verifyUser, async (req, res) => {
    const id = req.id;
    const sql = `
    SELECT * FROM notifikace WHERE fk_uzivatel = ?
`;

    try {
        const [notifikace] = await db.query(sql, [id]);

        return res.json({ Status: "Success", notifikace });
    } catch (error) {
        console.error(error);
        return res.json({ Error: 'Chyba při načítání inzerátů.' });
    }
})

//Požadavek na získaní všech inzerátů
apiRouter.get('/cars', async (req, res) => {
    const { znacka, model, karoserie, rokOd, vykonOd, cenaDo, palivo } = req.query;

    let sql = `
    SELECT 
        inzerat.id, 
        inzerat.nazev, 
        inzerat.cena, 
        inzerat.stav, 
        auto.najete_km, 
        auto.rok_vyroby, 
        auto.vykon_kw, 
        auto.palivo, 
        auto.karoserie, 
        auto.prevodovka, 
        uzivatel.kraj, 
        obrazky.obrazek, 
        znacka.nazev AS znacka, 
        model.nazev AS model
    FROM 
        inzerat 
    JOIN 
        auto ON inzerat.fk_auto = auto.id 
    JOIN 
        model ON auto.fk_model = model.id 
    JOIN 
        znacka ON model.fk_znacka = znacka.id
    JOIN 
        uzivatel ON inzerat.fk_uzivatel = uzivatel.id 
    JOIN 
        obrazky ON inzerat.id = obrazky.fk_inzerat 
    WHERE 
        obrazky.hlavni = true
    `;

    const values = [];

    if (znacka && znacka !== "0") {
        sql += ` AND znacka.nazev = ?`;
        values.push(znacka);
    }
    if (model && model !== "0") {
        sql += ` AND model.nazev = ?`;
        values.push(model);
    }
    if (karoserie && karoserie !== "0") {
        sql += ` AND auto.karoserie = ?`;
        values.push(karoserie);
    }
    if (rokOd) {
        sql += ` AND auto.rok_vyroby >= ?`;
        values.push(rokOd);
    }
    if (vykonOd) {
        sql += ` AND auto.vykon_kw >= ?`;
        values.push(vykonOd);
    }
    if (cenaDo) {
        sql += ` AND inzerat.cena <= ?`;
        values.push(cenaDo);
    }
    if (palivo && palivo !== "0") {
        sql += ` AND auto.palivo = ?`;
        values.push(palivo);
    }

    try {
        const [cars] = await db.query(sql, values);
        return res.json({ Status: "Success", cars });
    } catch (error) {
        console.error(error);
        return res.json({ Error: 'Chyba při načítání inzerátů.' });
    }
});

apiRouter.get('/simCars/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [refResult] = await db.query(
            'SELECT cena FROM inzerat WHERE id = ?',
            [id]
        );

        const refCena = refResult[0].cena;
        const minCena = refCena * 0.85;
        const maxCena = refCena * 1.15;

        const [cars] = await db.query(`
            SELECT 
                inzerat.id, 
                inzerat.nazev, 
                inzerat.cena, 
                inzerat.stav, 
                auto.najete_km, 
                auto.rok_vyroby, 
                auto.vykon_kw, 
                auto.palivo, 
                auto.karoserie, 
                auto.prevodovka, 
                uzivatel.kraj, 
                obrazky.obrazek, 
                znacka.nazev AS znacka, 
                model.nazev AS model
            FROM 
                inzerat 
            JOIN auto ON inzerat.fk_auto = auto.id 
            JOIN model ON auto.fk_model = model.id 
            JOIN znacka ON model.fk_znacka = znacka.id
            JOIN uzivatel ON inzerat.fk_uzivatel = uzivatel.id 
            JOIN obrazky ON inzerat.id = obrazky.fk_inzerat 
            WHERE 
                obrazky.hlavni = true
                AND inzerat.id != ?
                AND inzerat.cena BETWEEN ? AND ?
                AND inzerat.stav != 'Zrušený'
            LIMIT 3
        `, [id, minCena, maxCena]);

        return res.json({ Status: "Success", cars });
    } catch (error) {
        console.error(error);
        return res.json({ Error: 'Chyba při načítání inzerátů.' });
    }
});


apiRouter.get('/carsfilter', async (req, res) => {
    const { znacka, model, karoserie, pocetDveri, minSedadel, maxSedadel, prevodovka, palivo, barva, pohon, stav, rokOd, rokDo, vykonOd, vykonDo, objemOd, objemDo, najezdOd, najezdDo, cenaOd, cenaDo } = req.query;

    let sql = `
    SELECT 
        inzerat.id, 
        inzerat.nazev, 
        inzerat.cena, 
        inzerat.stav, 
        auto.najete_km, 
        auto.rok_vyroby, 
        auto.vykon_kw, 
        auto.palivo, 
        auto.karoserie, 
        auto.prevodovka, 
        uzivatel.kraj, 
        obrazky.obrazek, 
        znacka.nazev AS znacka, 
        model.nazev AS model
    FROM 
        inzerat 
    JOIN 
        auto ON inzerat.fk_auto = auto.id 
    JOIN 
        model ON auto.fk_model = model.id 
    JOIN 
        znacka ON model.fk_znacka = znacka.id
    JOIN 
        uzivatel ON inzerat.fk_uzivatel = uzivatel.id 
    JOIN 
        obrazky ON inzerat.id = obrazky.fk_inzerat 
    WHERE 
        obrazky.hlavni = true
    `;

    const values = [];

    if (znacka && znacka !== "0") {
        sql += ` AND znacka.nazev = ?`;
        values.push(znacka);
    }
    if (model && model !== "0") {
        sql += ` AND model.nazev = ?`;
        values.push(model);
    }
    if (karoserie && karoserie !== "0") {
        sql += ` AND auto.karoserie = ?`;
        values.push(karoserie);
    }
    if (pocetDveri && pocetDveri !== "0") {
        sql += ` AND auto.pocet_dveri = ?`;
        values.push(pocetDveri);
    }
    if (minSedadel && minSedadel !== "0") {
        sql += ` AND auto.pocet_sedadel >= ?`;
        values.push(minSedadel);
    }
    if (maxSedadel && maxSedadel !== "0") {
        sql += ` AND auto.pocet_sedadel <= ?`;
        values.push(maxSedadel);
    }
    if (prevodovka && prevodovka !== "0") {
        sql += ` AND auto.prevodovka = ?`;
        values.push(prevodovka);
    }
    if (palivo && palivo !== "0") {
        sql += ` AND auto.palivo = ?`;
        values.push(palivo);
    }
    if (barva && barva !== "0") {
        sql += ` AND auto.barva = ?`;
        values.push(barva);
    }
    if (pohon && pohon !== "0") {
        sql += ` AND auto.pohon = ?`;
        values.push(pohon);
    }
    if (stav && stav !== "0") {
        sql += ` AND inzerat.stav = ?`;
        values.push(stav);
    }
    if (rokOd) {
        sql += ` AND auto.rok_vyroby >= ?`;
        values.push(rokOd);
    }
    if (rokDo) {
        sql += ` AND auto.rok_vyroby <= ?`;
        values.push(rokDo);
    }
    if (vykonOd) {
        sql += ` AND auto.vykon_kw >= ?`;
        values.push(vykonOd);
    }
    if (vykonDo) {
        sql += ` AND auto.vykon_kw <= ?`;
        values.push(vykonDo);
    }
    if (objemOd) {
        sql += ` AND auto.objem >= ?`;
        values.push(objemOd);
    }
    if (objemDo) {
        sql += ` AND auto.objem <= ?`;
        values.push(objemDo);
    }
    if (najezdOd) {
        sql += ` AND auto.najete_km >= ?`;
        values.push(najezdOd);
    }
    if (najezdDo) {
        sql += ` AND auto.najete_km <= ?`;
        values.push(najezdDo);
    }
    if (cenaOd) {
        sql += ` AND inzerat.cena >= ?`;
        values.push(cenaOd);
    }
    if (cenaDo) {
        sql += ` AND inzerat.cena <= ?`;
        values.push(cenaDo);
    }

    try {
        const [cars] = await db.query(sql, values);
        return res.json({ Status: "Success", cars });
    } catch (error) {
        console.error(error);
        return res.json({ Error: 'Chyba při načítání inzerátů.' });
    }
});

apiRouter.get('/models/:brandId', async (req, res) => {
    try {
        const { brandId } = req.params;

        const [rows] = await db.query(`
            SELECT model.id, model.nazev 
            FROM model
            WHERE model.fk_znacka = ?
        `, [brandId]);

        res.json({ Status: "Success", models: rows });
    } catch (error) {
        res.json({ Status: "Error", Error: error.message });
    }
});


apiRouter.get('/brands', async (req, res) => {
    try {
        const [rows] = await db.query(`
        SELECT DISTINCT znacka.id, znacka.nazev 
        FROM znacka
        JOIN model ON model.fk_znacka = znacka.id
        JOIN auto ON auto.fk_model = model.id
      `);
        res.json({ Status: "Success", brands: rows });
    } catch (error) {
        res.json({ Status: "Error", Error: error.message });
    }
});

apiRouter.get('/karoserie', async (req, res) => {
    try {
        const [rows] = await db.query(`
        SELECT DISTINCT auto.karoserie
        FROM auto
      `);
        res.json({ Status: "Success", karoserie: rows });
    } catch (error) {
        res.json({ Status: "Error", Error: error.message });
    }
});

apiRouter.get('/pocet_dveri', async (req, res) => {
    try {
        const [rows] = await db.query(`
        SELECT DISTINCT auto.pocet_dveri
        FROM auto
        ORDER BY auto.pocet_dveri ASC
      `);
        res.json({ Status: "Success", pocetDveri: rows });
    } catch (error) {
        res.json({ Status: "Error", Error: error.message });
    }
});

apiRouter.get('/barvy', async (req, res) => {
    try {
        const [rows] = await db.query(`
        SELECT DISTINCT auto.barva
        FROM auto
      `);
        res.json({ Status: "Success", barvy: rows });
    } catch (error) {
        res.json({ Status: "Error", Error: error.message });
    }
});

apiRouter.post("/notifyNewMsg", async (req, res) => {
    const { id, jmeno, fk_uzivatel } = req.body;

    try {

        await db.query(
            `INSERT INTO notifikace (fk_uzivatel, typ, zprava, fk_konverzace)
                 VALUES (?, 'Nová Zpráva', ?, ?)`,
            [
                fk_uzivatel,
                `Uzivatel ${jmeno} vám poslal zprávu.`,
                id,
            ]
        );

        res.json({ Status: 'Success' });
    } catch (error) {
        console.error(error);
        res.json({ Error: 'error' })
    }
})

apiRouter.post("/notifyReportAdd", async (req, res) => {
    const { id, jmeno, prijmeni, fk_hodnoceni } = req.body;

    try {

        await db.query(
            `INSERT INTO notifikace (fk_uzivatel, typ, zprava, fk_hodnoceni)
                 VALUES (?, 'Nové hodnocení', ?, ?)`,
            [
                id,
                `Uzivatel ${jmeno} ${prijmeni} vám udělil recenzi.`,
                fk_hodnoceni,
            ]
        );

        res.json({ Status: 'Success' });
    } catch (error) {
        console.error(error);
        res.json({ Error: 'error' })
    }
})

apiRouter.post("/notifyPriceChange", async (req, res) => {
    const { name, newPrice, oldPrice, id } = req.body;

    try {
        const [oblibeniUzivatele] = await db.query(
            "SELECT fk_uzivatel FROM oblibene WHERE fk_inzerat = ?",
            [id]
        );

        const formattedOldPrice = Number(oldPrice).toLocaleString('cs-CZ');
        const formattedNewPrice = Number(newPrice).toLocaleString('cs-CZ');

        for (const uzivatel of oblibeniUzivatele) {
            await db.query(
                `INSERT INTO notifikace (fk_uzivatel, typ, zprava, fk_inzerat)
                 VALUES (?, 'Změna ceny', ?, ?)`,
                [
                    uzivatel.fk_uzivatel,
                    `Cena vašeho oblíbeného inzerátu: ${name} se změnila z ${formattedOldPrice} Kč na ${formattedNewPrice} Kč.`,
                    id,
                ]
            );
        }

        res.json({ Status: 'Success' });
    } catch (error) {
        console.error(error);
        res.json({ Error: 'error' })
    }
});

apiRouter.post("/notifyStatusChange", async (req, res) => {
    const { name, newStav, oldStav, id } = req.body;

    try {
        const [oblibeniUzivatele] = await db.query(
            "SELECT fk_uzivatel FROM oblibene WHERE fk_inzerat = ?",
            [id]
        );

        for (const uzivatel of oblibeniUzivatele) {
            await db.query(
                `INSERT INTO notifikace (fk_uzivatel, typ, zprava, fk_inzerat)
                 VALUES (?, 'Změna stavu', ?, ?)`,
                [
                    uzivatel.fk_uzivatel,
                    `Stav vašeho oblíbeného inzerátu: ${name} se změnil z '${oldStav}' na '${newStav}'.`,
                    id,
                ]
            );
        }

        res.json({ Status: 'Success' });
    } catch (error) {
        console.error(error);
        res.json({ Error: 'error' });
    }
});


apiRouter.delete('/ad/:adId/:carId', async (req, res) => {
    const { adId, carId } = req.params;

    try {
        const [carInfo] = await db.query('SELECT fk_model FROM auto WHERE id = ?', [carId]);
        const modelId = carInfo[0]?.fk_model;

        const [images] = await db.query('SELECT obrazek FROM obrazky WHERE fk_inzerat = ?', [adId]);

        if (images && images.length > 0) {
            for (const image of images) {
                const urlParts = image.obrazek.split('/');
                const publicId = `car-ads/${urlParts[urlParts.length - 1].split('.')[0]}`;
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (cloudinaryError) {
                    console.error('Error deleting from Cloudinary:', cloudinaryError);
                }
            }
        }

        await db.query('DELETE FROM historie WHERE fk_inzerat = ?', [adId]);
        await db.query('DELETE FROM notifikace WHERE fk_inzerat = ?', [adId]);
        await db.query('DELETE FROM oblibene WHERE fk_inzerat = ?', [adId]);
        await db.query('DELETE FROM obrazky WHERE fk_inzerat = ?', [adId]);
        await db.query('DELETE FROM inzerat WHERE id = ?', [adId]);
        await db.query('DELETE FROM auto WHERE id = ?', [carId]);

        if (modelId) {
            const [remainingCars] = await db.query('SELECT COUNT(*) as count FROM auto WHERE fk_model = ?', [modelId]);
            
            if (remainingCars[0].count === 0) {
                const [modelInfo] = await db.query('SELECT fk_znacka FROM model WHERE id = ?', [modelId]);
                const brandId = modelInfo[0]?.fk_znacka;

                await db.query('DELETE FROM model WHERE id = ?', [modelId]);

                if (brandId) {
                    const [remainingModels] = await db.query('SELECT COUNT(*) as count FROM model WHERE fk_znacka = ?', [brandId]);
                    
                    if (remainingModels[0].count === 0) {
                        await db.query('DELETE FROM znacka WHERE id = ?', [brandId]);
                    }
                }
            }
        }

        res.json({ Status: 'Success' });
    } catch (error) {
        console.error(error);
        res.json({ Error: 'Chyba při mazání inzerátu.' });
    }
});

apiRouter.delete('/history/:adId', verifyUser, async (req, res) => {
    const userId = req.id;
    const { adId } = req.params;

    try {
        await db.query('DELETE FROM historie WHERE fk_uzivatel = ? AND fk_inzerat = ?', [userId, adId]);

        res.json({ Status: 'Success' });
    } catch (error) {
        console.error(error);
        res.json({ Error: 'Chyba při mazání inzerátu.' });
    }
});

apiRouter.delete('/note/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('DELETE FROM notifikace WHERE id = ?', [id]);

        res.json({ Status: 'Success' });
    } catch (error) {
        console.error(error);
        res.json({ Error: 'Chyba při mazání notifikace.' });
    }
});

apiRouter.post('/note/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await db.query('UPDATE notifikace SET precteno = 1 WHERE id = ?', [id]);

        res.json({ Status: 'Success' });
    } catch (error) {
        console.error(error);
        res.json({ Error: 'Chyba při potvrzování notifikace.' });
    }
});

apiRouter.post('/editAdd', async (req, res) => {
    const data = req.body.editData;

    try {
        const sql = `
            UPDATE inzerat
            SET nazev = ?, cena = ?, popis = ?, stav = ?, datum_aktualizace = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        const values = [data.car.nazev, data.car.cena, data.car.popis, data.car.stav || 'Aktivní', data.car.id];

        await db.query(sql, values)

        res.json({ Status: "Success" })
    } catch (error) {

    }
})

apiRouter.get('/myadd', verifyUser, async (req, res) => {
    const userId = req.id;

    const sql = `
    SELECT 
        inzerat.id, 
        inzerat.nazev, 
        inzerat.cena,
        inzerat.popis, 
        inzerat.stav,
        inzerat.datum_vytvoreni,
        inzerat.datum_aktualizace,
        auto.id AS carId, 
        auto.najete_km, 
        auto.rok_vyroby, 
        auto.vykon_kw, 
        auto.palivo, 
        auto.karoserie, 
        auto.prevodovka,
        auto.barva,
        auto.objem,
        auto.pohon,
        auto.pocet_sedadel,
        auto.pocet_dveri,
        auto.vin,
        model.nazev AS model,
        znacka.nazev AS znacka,  
        uzivatel.kraj,
        uzivatel.id AS userId, 
        obrazky.obrazek
    FROM 
        inzerat 
    JOIN 
        auto ON inzerat.fk_auto = auto.id
    JOIN
        model ON auto.fk_model = model.id
    JOIN 
        znacka ON model.fk_znacka = znacka.id 
    JOIN 
        uzivatel ON inzerat.fk_uzivatel = uzivatel.id 
    JOIN 
        obrazky ON inzerat.id = obrazky.fk_inzerat 
    WHERE 
        inzerat.fk_uzivatel = ? AND obrazky.hlavni = true
    GROUP BY 
        inzerat.id;
`;

    try {
        const [cars] = await db.query(sql, [userId]);

        if (cars.length > 0) {

            return res.json({ cars, Status: "Success" });
        } else {
            return res.json({ Error: 'Žádné inzeráty nenalezeny.' });
        }
    } catch (error) {
        console.error(error);
        return res.json({ Error: 'Chyba při načítání inzerátů.' });
    }
})

apiRouter.post('/zobrazeni', async (req, res) => {
    const { carId } = req.body;
    try {
        await db.query('UPDATE inzerat SET pocet_zobrazeni = pocet_zobrazeni + 1 WHERE id = ?', [carId]);
        res.json({ Status: "Success" });
    } catch (err) {
        console.error(err);
        res.json({ Status: "Error", Error: "Chyba při ukládání zobrazení." });
    }
})

apiRouter.post('/visit', verifyUser, async (req, res) => {
    const userId = req.id;
    const { carId } = req.body;

    try {
        const [rows] = await db.query(
            'SELECT * FROM historie WHERE fk_uzivatel = ? AND fk_inzerat = ?',
            [userId, carId]
        );

        if (rows.length > 0) {
            await db.query(
                'UPDATE historie SET datum_navstevy = NOW() WHERE fk_uzivatel = ? AND fk_inzerat = ?',
                [userId, carId]
            );
        } else {
            await db.query(
                'INSERT INTO historie (fk_uzivatel, fk_inzerat, datum_navstevy) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE datum_navstevy = NOW()',
                [userId, carId]
            );
        }

        res.json({ Status: "Success" });
    } catch (err) {
        console.error(err);
        res.json({ Status: "Error", Error: "Chyba při ukládání návštěvy." });
    }
});


apiRouter.get('/history', verifyUser, async (req, res) => {
    const userId = req.id;
    const sql = `
    SELECT 
        inzerat.id, 
        inzerat.nazev, 
        inzerat.cena,
        inzerat.popis, 
        inzerat.stav,
        inzerat.datum_vytvoreni,
        inzerat.datum_aktualizace,
        auto.id AS carId, 
        auto.najete_km, 
        auto.rok_vyroby, 
        auto.vykon_kw, 
        auto.palivo, 
        auto.karoserie, 
        auto.prevodovka,
        auto.barva,
        auto.objem,
        auto.pohon,
        auto.pocet_sedadel,
        auto.pocet_dveri,
        auto.vin,
        model.nazev AS model,
        znacka.nazev AS znacka,  
        uzivatel.kraj,
        uzivatel.id AS userId, 
        obrazky.obrazek,
        historie.datum_navstevy
    FROM 
        historie
    JOIN
        inzerat ON historie.fk_inzerat = inzerat.id 
    JOIN 
        auto ON inzerat.fk_auto = auto.id
    JOIN
        model ON auto.fk_model = model.id
    JOIN 
        znacka ON model.fk_znacka = znacka.id 
    JOIN 
        uzivatel ON inzerat.fk_uzivatel = uzivatel.id 
    JOIN 
        obrazky ON inzerat.id = obrazky.fk_inzerat 
    WHERE 
        historie.fk_uzivatel = ? AND obrazky.hlavni = true
    ORDER BY 
        historie.datum_navstevy DESC;
`;

    try {
        const [cars] = await db.query(sql, [userId]);

        if (cars.length > 0) {

            return res.json({ cars, Status: "Success" });
        } else {
            return res.json({ Error: 'Žádné inzeráty nenalezeny.' });
        }
    } catch (error) {
        console.error(error);
        return res.json({ Error: 'Chyba při načítání inzerátů.' + error });
    }
})

apiRouter.get('/odhlasit', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.json({ Error: "Nepodařilo se odhlásit." })
            }
            return res.json({ Status: 'Success' });
        })
    }
});

app.listen(port, () => {
    console.log(`Server běží...`);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});