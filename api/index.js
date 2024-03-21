const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());

var CONNECTION_STRING = "mongodb+srv://admin:MDPAtlasBUT3@cluster0.nmmobdk.mongodb.net/?retryWrites=true&w=majority";
var DATABASE_NAME = "masociete";
let database;


app.listen(5038, () => {
    MongoClient.connect(CONNECTION_STRING, (error, client) => {
        database = client.db(DATABASE_NAME);
        console.log("Mongo DB connecté !");
    });
});

app.get('/api/GetNotes', (request, response) => {
    database.collection("departements").find({}).toArray((error, result) => {
        response.send(result);
    });
});

app.get('/api/SearchNotes', (request, response) => {
    const searchNom = request.query.searchNom;

    database.collection("departements").find({ nom: searchNom }).toArray((error, result) => {
        if (error) {
            console.error("Erreur de recherche :", error);
            response.status(500).send("Erreur de recherche");
        } else {
            console.log("Résultat de la recherche :", result);
            response.send(result);
        }
    });
});


app.post('/api/AddNotes', multer().any(), (request, response) => {
    database.collection("departements").count({}, (error, numOfDocs) => {
        database.collection("departements").insertOne({
            code: (numOfDocs + 1).toString(),
            nom: request.body.newNom
        });
        response.json("L'ajout a été effectué avec succès !");
    });
});

app.delete('/api/DeleteNotes', (request, response) => {
    const id = request.query.id;
    database.collection("departements").deleteOne({ _id: ObjectId(id) }, (error, result) => {
        if (error) {
            console.error("Erreur lors de la suppression :", error);
            response.status(500).json("Erreur lors de la suppression.");
        } else {
            response.json("Le departement a été supprimé !");
        }
    });
});

// Ajoute cette route pour la modification
app.put('/api/UpdateNotes', multer().any(), (request, response) => {
    const id = request.body.id;
    const updatedNom = request.body.updatedNom;

    // Utilise updateOne pour mettre à jour le nom
    database.collection("departements").updateOne(
        { _id: ObjectId(id) },
        { $set: { nom: updatedNom } },
        (error, result) => {
            if (error) {
                console.error("Erreur lors de la mise à jour :", error);
                response.status(500).json("Erreur lors de la mise à jour.");
            } else {
                response.json("Mise à jour réussie !");
            }
        }
    );
});