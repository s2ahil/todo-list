//jshint esversion:6

const express = require("express");

const bodyparser = require("body-parser");

const mongoose = require('mongoose');
const app = express();

const _ = require('lodash');

// mongoose
mongoose.connect("mongodb+srv://sahil:s2ahil@atlascluster.x8tij.mongodb.net/todolistDB", { useNewUrlParser: true })

// collections = find;
//js object  // mongoose schema
const itemsSchema = {
  name: String
}

//mongoose model
const item = mongoose.model(
  "Item",
  itemsSchema
);

//mongoose document
const item1 = new item({
  name: " welcome to todo list"
})

const item2 = new item({
  name: "hit + to add new item "
})

const item3 = new item({
  name: "<- hit this to delete an item"
})

const defaultItems = [item1, item2, item3]


const listschema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listschema);


function add() {
  item.insertMany(defaultItems, function (err) {
    if (err) {
      console.log(err)
    } else {
      console.log("successfully saved defualt items to db")
    }
  })
}


// we can add workitems  const array but not assign a completely different array
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("styles"));


app.get("/", function (req, res) {

  // {} - all 
  item.find({}, function (err, founditems) {

    if (founditems.length === 0) {
      add();
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: "Today", newlistitem: founditems });
      console.log(founditems)
    }


  })


});

app.post("/", function (req, res) {

  const itemName = req.body.newitem;
  var listName = req.body.list;
 
  // asli name hai 
  const newitem = new item({
    name: itemName
  })


  if (listName == "Today") {
    newitem.save();
    res.redirect("/")
  } else {
    console.log("not today")
    List.findOne({ name: listName }, function (err, docs) {

      if (err) {
        throw err;
      }
      else {
        docs.items.push(newitem);
        docs.save();
        res.redirect("/" + listName);
      }

    })
  }





});

app.post("/delete", function (req, res) {

  const checkeditemid = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {

    item.findByIdAndRemove(checkeditemid, function (err) {
      if (err) {

        throw err;

      }
      else {

        console.log("successfully deleted check");
        res.redirect("/");

      }
    })
  } else {

    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkeditemid}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
})


app.get("/:customlistname", function (req, res) {
  const customListName = _.capitalize(req.params.customlistname);


  List.findOne({ name: customListName }, function (err, foundlist) {

    if (!err) {
      if (!foundlist) {
        const list = new List({
          name: customListName,
          items: defaultItems

        });

        list.save();
        res.redirect("/" + customListName)
      } else {

        res.render("list", { listTitle: foundlist.name, newlistitem: foundlist.items })
      }

    } else {
      throw err;
    }

  })





})






app.get("/about", function (req, res) {
  res.render("about");
});
app.listen(3000, function () {
  console.log("server started on port 3000");
});
