const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const user = "organic12";
const password = "organic12";
const dbName = "Digi_Upaay";
const dbCollection = "Meals";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = 5000;

const uri = `mongodb+srv://${user}:${password}@cluster0.mw9o0.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const collection = client.db(dbName).collection(dbCollection);

  //   1) Post request api which creates above type of document in collection.
  app.post("/api/create", (req, res) => {
    const mealInfo = req.body;
    mealInfo.foods.forEach(food => {
        food._id = new ObjectId();
    })
    collection.insertOne(mealInfo).then((result) => {
      res.send(result);
    });
  });

  //   2) Patch request api to update item in food array.
  app.patch("/api/update/:updateValue", (req, res) => {
    const updateValue = req.params.updateValue;
    const updatedValue = req.body.updatedValue;
    collection.updateMany(
      {},
      { $set: { "foods.$[].food.$[item]": updatedValue } },
      { arrayFilters: [  { "item": updateValue } ]}
    ).then((result) => {
      res.send(result.modifiedCount > 0);
    })
  });

  //   3) Delete api to delete items from foods array.
  app.delete("/api/delete/:id", (req, res) => {
      collection.deleteOne({_id: ObjectId(req.params.id)}).then(result => {
          res.send(result.deletedCount > 0);
      })
  });

  //   4) Get request api to fetch all documents.
  app.get("/api/getAll", (req, res) => {
    collection.find({}).toArray((err, meals) => {
      res.send(meals);
    });
  });

  //   5) Get request api to fetch documents with mealType.
  app.get("/api/:mealType", (req, res) => {
    collection.find({mealType: req.params.mealType}).toArray((err, meal) => {
      res.send(meal[0]);
    });
  });
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
