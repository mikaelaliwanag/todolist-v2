const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});


////SCHEMA////
const itemsSchema = {
  name: String
};

//////MONGOOSE MODEL/////
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
    name: "Type a new item below"
  });

const item2 = new Item ({
    name: "Click the + button to add the new item"
  });

const item3 = new Item ({
    name: "<--Click this to delete an item"
  });


const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

//////HOME ROUTE/////
app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err); 
          } else {
            console.log("Successfully saved default items to DB");
          }
        });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })

});

/////ADD NEW ITEM/////
app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  if(itemName !== "") {
    item.save();
  } 

  res.redirect("/");
});

/////CUSTOM LIST//////
app.get("/:customListName", function(req, res) {

    const customListName = req.params.customListName;

    List.findOne({name: customListName}, function(err, foundList) {
      if (!err) {
        if (!foundList) {

         ////create a new list////
          const list = new List ({
              name: customListName,
              items: defaultItems
            })

            list.save();
            res.redirect("/" + customListName);
        } else {

        /////Show an existing list////       
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }

      }
    })
});

////DELETE ITEM/////
app.post("/delete", function(req, res) {
  
  const checkedItemId = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId, function(err) {
    if (!err) {
      console.log("Successfully deleted item");
      res.redirect("/");
    }

  })
    
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
