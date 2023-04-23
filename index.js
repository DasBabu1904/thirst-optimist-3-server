const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
require('dotenv').config();



//middle ware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASSWORD}@registration.ed9wooh.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});




function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    console.log(token)

    jwt.verify(token, process.env.ACCESS_TOCKEN_SIGNIN, function (err, decoded) {
        if (err) {
            console.log("in the jhamela = ", err)
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//         return res.status(401).send({ message: 'unauthorized access' });
//     }
//     const token = authHeader.split(' ')[1];
//     console.log(token)

//     jwt.verify(token, process.env.ACCESS_TOCKEN_SIGNIN, function (err, decoded) {
//         if (err) {
//             console.log("in the jhamela = ", err)
//             return res.status(403).send({ message: 'Forbidden access' });
//         }
//         req.decoded = decoded;
//         next();
//     })
// }

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        app.post('/jwt', async (req, res) => {
            console.log("jwt called")
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOCKEN_SIGNIN, { expiresIn: '1h' });
            res.send({ token })
        })

        // app.get('/profile', verifyJWT, async (req, res) => {
        //     console.log("profile accress request");
        //     const decoded = req.decoded;

        //     if (decoded.email !== req.query.email) {
        //         res.status(403).send({ message: 'unauthorized access' })
        //     }

        //     let query = {};
        //     if (req.query.email) {
        //         query = {
        //             email: req.query.email
        //         }
        //     }
        //     res.send("Verified");
        // });

        app.get('/profile', verifyJWT, async (req, res) => {
            console.log("profile accress request");
            const decoded = req.decoded;

            if (decoded.email !== req.query.email) {
                return res.status(403).send({ message: 'unauthorized access' });
            }

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            res.send("Verified");
        });


    } finally {
        await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("server is running ");
});

app.listen(port, () => {
    console.log(`Lesting form port ${port}`);
})