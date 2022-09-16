const dotenv = require("dotenv")
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const ejs = require("ejs");
const path = require('path');
const _ = require("lodash");
const port = 4000;

const app = express();

dotenv.config()

mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster1.pkihfp9.mongodb.net/blogDB`);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')))

app.use(bodyParser.urlencoded({extended: true}));


const defaultContent = {
  about: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  contact: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
};


const postSchema = new Schema({
  title: String,
  tag: String,
  content: String
})

const Post = model('Post', postSchema);

const today = new Date();

const options = {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
}

const day = today.toLocaleDateString("en-US", options);

app.get("/", function(req, res){

  Post.find({}, function(err, foundPosts){
    if (err) {
      console.log(err);
    } else{
      res.render("home", {
        startingContent: defaultContent.home,
        posts: foundPosts,
        date: day
        });
    }
  })

});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: defaultContent.about});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: defaultContent.contact});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){

    const title = req.body.postTitle;
    const tag = req.body.postTag;
    const content = req.body.postBody;

    const post = new Post({
      title: title,
      tag: tag,
      content: content
    });

    post.save();

  res.redirect("/");

});

app.get("/:postName", function(req, res){
  const requestedTitle = req.params.postName.toLowerCase();
  
  Post.find({}, function(err, foundPosts){
    if (err) {
      console.log(err);
    } else {
        foundPosts.forEach(function(post){
        const storedTitle = post.title.toLowerCase();

        if (storedTitle === requestedTitle) {
          res.render("post", {
            title: post.title,
            tag: post.tag,
            content: post.content,
            date: day
          });
        }
      });
    }
  });

});

app.post("/delete", function(req, res){
  const postName = req.body.post;
  Post.findByIdAndRemove(postName, function(err){
    if (err) {
      console.log(err);
    } else {
      console.log("Deleted succesfully");

      res.redirect("/");
    }
  })
})

app.listen(process.env.PORT || port, function() {
  console.log("Server up and running");
});
