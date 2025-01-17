import express from 'express';
import mysql2 from 'mysql2';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookie from 'cookie-parser';
import nodeMailer from 'nodemailer';
import session from 'express-session';
import path from 'path';

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['POST', 'GET', 'DELETE'],
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
}))

app.use((req, res, next) => {
    res.locals.session = req.session.user;
    next();
})

app.use("/uploads", express.static(path.join('./uploads')));


app.use(cookie());

//Připojení databáze
const db = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "autobazar"
})

//Kontrola připojení k databázi
db.connect((err) => {
    if (err) {
        console.log('Chyba při připojení k databázi: ' + err);
        return;
    }
    console.log('Připojeno k databázi');
});

//Kontrola přihlášení
const verifyUser = (req, res, next) => {
    const user = req.session.user;

    if (!user || !user.id) {
        return res.json({Error: "Nejsi přihlášen"});
    } else {
        req.id = user.id;
        next();
    }
}

//Požadavek na kontrolu přihlášení
app.get('/check', verifyUser, (req, res) => {
    return res.json({ Status: 'Success' })
});

//Požadavek na registraci
app.post('/registrace', async (req, res) => {
    try {
        const checkPhoneNumberSql = "SELECT * FROM uzivatel WHERE telefon = ?";
        const [phoneResult] = await db.promise().query(checkPhoneNumberSql, [req.body.celyTelefon]);
        if (phoneResult.length > 0) {
            return res.json({ Error: "Tento telefon je již zaregistrován." });
        }

        const checkEmailSql = "SELECT * FROM uzivatel WHERE email = ?";
        const [emailResult] = await db.promise().query(checkEmailSql, [req.body.email]);
        if (emailResult.length > 0) {
            return res.json({ Error: "Tento e-mail je již zaregistrován." });
        }

        const hashedPassword = await bcrypt.hash(req.body.heslo.toString(), 10);

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

        await db.promise().query(sql, values);

        return res.json({ Status: "Success" });

    } catch (err) {
        return res.json({ Error: "Nastala chyba při zpracování registrace." });
    }
});

// Přidání inzerátu do oblíbených
app.post('/favor', verifyUser, async (req, res) => {
    const id = req.id;
    const { carId, cena } = req.body;
    const sql = 'INSERT INTO oblibene (`fk_uzivatel`, `fk_inzerat`, `cenaPriUlozeni`) VALUES (?, ?, ?)';
    try {
        await db.promise().query(sql, [id, carId, cena]);
        res.json({ Status: 'Success' });
    }
    catch (err) {
        res.json({ Error: 'Nastala chyba při přidání auta do oblíbených.' })
    }
})

//odebrání inzerátu z oblíbených
app.delete('/favor/:carId', verifyUser, async (req, res) => {
    const id = req.id;
    const { carId } = req.params;
    const sql = 'DELETE FROM oblibene WHERE fk_uzivatel = ? AND fk_inzerat = ?';
    try {
        await db.promise().query(sql, [id, carId]);
        res.json({ Status: 'Success' });
    } catch (err) {
        res.json({ Error: 'Nepodařilo se odebrat auto z oblíbených.' });
    }
});

//Získání oblíbených inzerátů (Kvůli zobrazení srdce když uživatel hledá vozidla)
app.get('/favor', verifyUser, async (req, res) => {
    const id = req.id;
    const sql = 'SELECT fk_inzerat FROM oblibene WHERE fk_uzivatel = ?';
    try {
        const [favourites] = await db.promise().query(sql, [id]);
        res.json({ Status: 'Success', favourites });
    } catch (err) {
        console.error(err);
        res.json({ Error: 'Nepodařilo se načíst oblíbená auta.' });
    }
});

//Získaní oblíbených inzerátů (Kvůli zobrazení srdce na samostatném inzerátu)
app.get('/singleFavourite/:carId', verifyUser, async (req, res) => {
    const id = req.id; // ID uživatele z middleware verifyUser
    const { carId } = req.params; // ID inzerátu z URL
    const sql = 'SELECT 1 FROM oblibene WHERE fk_uzivatel = ? AND fk_inzerat = ? LIMIT 1';

    try {
        const [rows] = await db.promise().query(sql, [id, carId]);

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
app.get('/favourites', verifyUser, async (req, res) => {
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
        const [cars] = await db.promise().query(sql, [id]);

        if (cars.length === 0) {
            return;
        }

        return res.json({ Status: "Success", cars });
    } catch (err) {
        return res.json({ Error: "Nastala chyba při zpracování oblíbených aut." });
    }
})

//Požadavek na přihlášení
app.post('/prihlaseni', async (req, res) => {
    try {
        const sql = 'SELECT * FROM uzivatel WHERE email = ?';

        const [userData] = await db.promise().query(sql, [req.body.email]);

        if (userData.length === 0) {
            return res.json({ Error: "Tento email není registrován" });
        }

        const user = userData[0];

        const passwordMatch = await bcrypt.compare(req.body.heslo.toString(), user.heslo);
        if (!passwordMatch) {
            return res.json({ Error: "Hesla se neshodují" });
        }

        req.session.user = { id: user.id }

        return res.json({ Status: 'Success' });
    } catch (err) {
        return res.json({ Error: "Nastala chyba při zpracování přihlášení." });
    }
});

//Požadavek na odeslání emailu pro změnu hesla
app.post('/resetPassword', async (req, res) => {
    try {
        const sql = 'SELECT * FROM uzivatel WHERE email = ?';
        const [userData] = await db.promise().query(sql, [req.body.email]);

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
            text: `Odkaz je platný po dobu 10 minut: http://localhost:3000/restorePassword/${token}`
        };

        await transporter.sendMail(mailOptions);

        return res.json({ Status: 'Success' });
    } catch (err) {
        return res.json({ Error: "Nastala chyba při zpracování požadavku." });
    }
})

//Požadavek na obnovení hesla
app.post('/restorePassword/:token', async (req, res) => {
    const { token } = req.params;
    const { heslo } = req.body;

    try {
        const decoded = jwt.verify(token, "tajnyKlic");
        
        if (!decoded) {
            return res.json({ Error: "Neplatný nebo vypršený token." });
        }

        const userId = decoded.id;

        const hash = await bcrypt.hash(heslo, 10);

        const sqlChange = 'UPDATE uzivatel SET heslo = ? WHERE id = ?';
        const [result] = await db.promise().query(sqlChange, [hash, userId]);

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
app.get('/profile', verifyUser, async (req, res) => {
    const id = req.id;
    const sql = 'SELECT jmeno, prijmeni, email, telefon, kraj, mesto, role FROM uzivatel WHERE id = ?';

    try {
        const [result] = await db.promise().query(sql, [id]);

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
app.get('/car/:id', async (req, res) => {
    const id = req.params.id;

    const sql = `
        SELECT 
            inzerat.id, 
            inzerat.nazev AS inzerat_nazev, 
            inzerat.cena, 
            inzerat.stav, 
            inzerat.popis, 
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
            uzivatel.kraj, 
            uzivatel.jmeno, 
            uzivatel.prijmeni, 
            uzivatel.mesto, 
            uzivatel.telefon, 
            uzivatel.email, 
            GROUP_CONCAT(obrazky.obrazek SEPARATOR ',') AS obrazky
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
        const [result] = await db.promise().query(sql, [id]);

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
app.post('/profile', verifyUser, async (req, res) => {
    const id = req.id;
    try {
        if (req.body.isSamePhone === false) {
            const [phoneResult] = await db.promise().query("SELECT * FROM uzivatel WHERE telefon = ?", [req.body.editData.telefon]);
            if (phoneResult.length > 0) {
                return res.json({ Error: "Tento telefon je již zaregistrován" });
            }
        }

        if (req.body.isSameEmail === false) {
            const [emailResult] = await db.promise().query("SELECT * FROM uzivatel WHERE email = ?", [req.body.editData.email]);
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
        await db.promise().query(sql, values);
        return res.json({ Status: "Success" });
    } catch (err) {
        return res.json({ Error: "Nastala chyba při zpracování požadavku." });
    }
});

//Požadavek na získaní všech inzerátů
app.get('/cars', async (req, res) => {
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
        obrazky.obrazek 
    FROM 
        inzerat 
    JOIN 
        auto ON inzerat.fk_auto = auto.id 
    JOIN 
        uzivatel ON inzerat.fk_uzivatel = uzivatel.id 
    JOIN 
        obrazky ON inzerat.id = obrazky.fk_inzerat 
    WHERE 
        obrazky.hlavni = true;
`;

    try {
        const [cars] = await db.promise().query(sql);

        return res.json({ Status: "Success", cars });
    } catch (error) {
        console.error(error);
        return res.json({ Error: 'Chyba při načítání inzerátů.' });
    }
})

//Odhlášení
app.get('/odhlasit', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.json({ Error: "Nepodařilo se odhlásit." })
            }
            return res.json({ Status: 'Success' });
        })
    }
});

//Port
app.listen(port, () => {
    console.log(`Server běží na portu ${port}...`);
});