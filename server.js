const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI)

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})


var Schema = mongoose.Schema;

var userSchema = new Schema ({
  username : {type: String, required: true},
  id : {type: String, required: true}
});

var Users = mongoose.model('users', userSchema);


var exerciseSchema = new Schema ({
  username : {type: String, required: true},
  description : {type: String, required: true},
  duration : {type: Number, required: true},
  id : {type: String, required: true},
  date : {type: String}
});

var Exercises = mongoose.model('exercises', exerciseSchema);


app.post("/api/exercise/new-user", (req, res) => {
  var username = req.body.username;
  console.log(req.body.username)
  Users.findOne({username: username}, (err, storedUser) => {
    if(err) return;
    if(storedUser) {
      res.json('username taken'); 
    } else {
      var id = generateId();
      var newUser = new Users({username : username, id: id});
      newUser.save(function(err) {
        if (err) return;
        res.json({username: username, id: id});
      });
    }
  });
});

app.post("/api/exercise/add", (req, res) => {
  var id = req.body.userId;
  Users.findOne({id : id}, (err, storedUser) => {
    if(err) return; 
    if(storedUser) {
      var username = storedUser.username;
      var description = req.body.description;
      var duration = req.body.duration;
      var date = req.body.date === '' ? Date() : new Date(req.body.date).toString();
      var newExercise = new Exercises({username : username, description : description, duration : duration, id : id, date : date});
      newExercise.save((err) => {
        if(err) return;
        res.json({username : username, description : description, duration : duration, id : id, date : date});
      })
    } else {
      res.json('unknown id')
    }
  });
});

app.get("/api/exercise/users", (req, res) => {
  Users.find({}).select('-_id -__v').exec((err, users) => {
    res.json(users);
  });
});

app.get('/api/exercise/log',(req,res) => {
  var userId = req.query.userId;
  Users.findOne({id: userId}, (err, user) => {
    if(err) return;
    if(user) {
      var limit = Number(req.query.limit);

        Exercises.find({id: userId}).limit(limit).select('-_id description duration date').exec((err, log) => {
          if(err) return;
          if (req.query.from !== undefined) {
            log = log.filter((exercise) => exercise.date >= new Date(req.query.from));
          }
          if (req.query.to !== undefined) {
            log = log.filter((exercise) => exercise.date <= new Date(req.query.to));
          }
          var count = log.length;
          res.json({id: userId, username: user.username, count: count, log: log});
        });
     
    } else {
      res.json('id not found')  
    }
  });
});

// https://gist.github.com/gordonbrander/2230317
var generateId = function () {
  return Math.random().toString(36).substr(2, 9);
};


  console.log('Your app is listening on port ' + listener.address().port)
})
