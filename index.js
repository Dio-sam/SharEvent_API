require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const compression = require("compression");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const HTTPBearerStrategy = require("passport-http-bearer").Strategy;
const uid2 = require("uid2");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const uploadEvents = multer({ dest: "public/uploads/events" });
const uploadFiles = multer({ dest: "public/uploads/fileshare" });
const uploadProfile = multer({ dest: "public/uploads/profile" });
const bodyParser = require("body-parser");
const UserModel = require("./models").User;
const EventModel = require("./models").Event;
const ShareModel = require("./models").Share;
const MessageModel = require("./models").Message;
const { DB_HOST, DB_PORT, DB_NAME, PORT } = process.env;
const port = process.env.PORT || PORT;
const mongoUri =
  process.env.MONGODB_URI || `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true
});

const app = express();

const http = require("http");
const server = http.Server(app);
const io = require("socket.io")(server);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
// Enable CORS
app.use(cors());
// Protects the server from HTTP vulnerabilities
app.use(helmet());
// Serveur responses (> 1024 bytes) will be compressed to GZIP format to reduce response size
app.use(compression());
app.use(bodyParser.json());
app.use(passport.initialize());
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
      session: false
    },
    UserModel.authenticateLocal()
  )
);
// bearer is used to authenticate via a token
// const authBearer = UserModel.authenticateBearer;
// console.log('authBearer', authBearer);
// / bearer is used to authenticate via a token
passport.use(new HTTPBearerStrategy(UserModel.authenticateBearer())); // `authenticateBearer` has been declared in the User Model
function getExtension(type) {
  switch (type) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    case "image/gif":
      return ".gif";
    case "application/pdf":
      return ".pdf";

    default:
      return ".jpg";
  }
}

// model events
app.get("/api/events", function(req, res) {
  EventModel.find({}, function(err, events) {
    if (err) {
      return res.json({
        message: "Error when getting events.",
        error: err
      });
    }
    return res.json({
      success: true,
      events
    });
  });
});
app.get("/api/users/:id/events", function(req, res) {
  EventModel.find({user:req.params.id}, function(err, events) {
    if (err) {
      return res.json({
        message: "Error when getting events.",
        error: err
      });
    }
    return res.json({
      success: true,
      events
    });
  });
});
app.get("/api/events/:id", function(req, res) {
  EventModel.findOne({ _id: req.params.id }, function(err, event) {
    if (err) {
      return res.json({
        message: "Error when getting event.",
        error: err
      });
    }
    return res.json({
      success: true,
      event
    });
  });
});
app.post("/api/events", uploadEvents.single("picture"), function(
  req,
  res
) {
  let picture = "";
  console.log(req);

  if (req.file !== undefined) {
    picture = `uploads/events/${req.file.filename}${getExtension(
      req.file.mimetype
    )}`;
    var newImage = `public/uploads/events/${req.file.filename}${getExtension(
      req.file.mimetype
    )}`;
    fs.rename(req.file.path, newImage, function() {
      console.log("picture has been uploading!");
    });
  } else {
    picture = "";
  }
  var event = new EventModel({
    name: req.body.name || "",
    summary: req.body.summary || "",
    description: req.body.description || "",
    address: req.body.address || "",
    url: req.body.url,
    location: {
      lat: req.body.lat || "",
      lng: req.body.lng || ""
    },
    picture: picture || "",
    is_free: req.body.is_free || true,
    start: req.body.start || "",
    end: req.body.end || "",
  });

  event.save(function(err, event) {
    if (err !== null) {
      return res.json({
        message: "Error when saving event.",
        error: err
      });
    }
    return res.json({
      success: true,
      data: event
    });
  });
});

app.put("/api/events/:id", function(req, res) {
  let user = req.query.user;
  let address = req.query.address;
  EventModel.updateOne(
    { _id: req.params.id },
    {
      user
    },
    function(err, result) {
      if (err) {
        return res.json({
          message: "Error when update saving event.",
          error: err
        });
      }
      return res.json({
        data: {
          isUpdate: result
        }
      });
    }
  );
});

app.delete("/api/events/:id", function(req, res) {
  EventModel.deleteOne({ _id: req.params.id }, function(err, result) {
    if (err) {
      return res.json({
        message: "Error when delete event.",
        error: err
      });
    }
    return res.json({
      success: true,
      data: {
        isDeleted: true
      }
    });
  });
});

// model share
app.get("/api/shares", function(req, res) {
  ShareModel.find({}, function(err, shares) {
    if (err) {
      return res.json({
        message: "Error when getting shares.",
        error: err
      });
    }
    return res.json({
      success: true,
      data: shares
    });
  });
});

app.get("/api/shares/:id", function(req, res) {
  ShareModel.findOne({ _id: req.params.id })
    .populate("user")
    .populate("event")
    .exec(function(err, share) {
      if (err) {
        return res.json({
          message: "Error when getting share.",
          error: err
        });
      }
      return res.json({
        success: true,
        data: share
      });
    });
});
app.get("/api/users/:id/shares", function(req, res) {
  console.log("reqzzbody", res);
  ShareModel.find({ user: req.params.id })
    .populate("event")
    .exec(function(err, share) {
      if (err) {
        return res.json({
          message: "Error when getting share.",
          error: err
        });
      }
      return res.json({
        success: true,
        data: share
      });
    });
});

let fields = uploadFiles.fields([{ name: "files" }]);
app.post("/api/events/:id/users/:idUser/shares", fields, function(req, res) {
  let documents = [];
  console.log("req.body", typeof JSON.parse(req.body.main_ideas));
  console.log("reqggggggggg",req);
  console.log("req.params",req.params);
  console.log("req.body",req.body);
  console.log("req.files",req.files);
  console.log("res",res)

  let files = req.files || {};

  if (Object.keys(files).length !== 0) {
    documents = files["files"].map(
      file => `uploads/fileshare/${file.filename}${getExtension(file.mimetype)}`
    );
    files["files"].map(file => {
      return fs.rename(
        file.path,
        `public/uploads/fileshare/${file.filename}${getExtension(
          file.mimetype
        )}`,
        function() {
          console.log("file has been uploading!");
        }
      );
    });
  }
  const share = new ShareModel({
    description: req.body.description || "",
    files: documents || "",
    user: req.params.idUser,
    event: req.params.id,
    contacts: JSON.parse(req.body.contacts),
    main_ideas: JSON.parse(req.body.main_ideas),
    summarize: req.body.summarize || "",
    eventName: req.body.eventName
    // $push:{contacts:{
    //   $each:[{
    //   name_society:req.body.name_society||'',
    //   name_contact:req.body.name_contact||'',
    //   phone:req.body.phone||''
    //   }]
    // }},
  });

  share.save(function(err, share) {
    if (err !== null) {
      return res.json({
        message: "Error when saving share.",
        error: err
      });
    }
    console.log("share",share)
    return res.json({
      success: true,
      data: share
    });
  });
});

app.put("/api/shares/:id", function(req, res) {
  let summarize = req.query.summarize;
  ShareModel.updateOne(
    { _id: req.params.id },
    {
      summarize
    },
    function(err, result) {
      if (err) {
        return res.json({
          message: "Error when update share.",
          error: err
        });
      }
      return res.json({
        data: {
          isUpdate: result
        }
      });
    }
  );
});

app.delete("/api/shares/:id", function(req, res) {
  EventModel.deleteOne({ _id: req.params.id }, function(err, result) {
    if (err) {
      return res.json({
        message: "Error when delete share.",
        error: err
      });
    }
    return res.json({
      success: true,
      data: {
        isDeleted: true
      }
    });
  });
});
// messages
app.get("/api/messages", function(req, res) {
  MessageModel.find({}, function(err, messages) {
    if (err) {
      return res.json({
        message: "Error when getting messages.",
        error: err
      });
    }
    return res.json({
      success: true,
      data: messages
    });
  });
});
app.get("/api/users/:id/messages/:idMsg", function(req, res) {
  MessageModel.findOne({ _id: req.params.idMsg }, function(err, message) {
    if (err) {
      return res.json({
        message: "Error when getting message.",
        error: err
      });
    }
    return res.json({
      success: true,
      data: message
    });
  });
});
app.post("/api/users/:id/messages", function(req, res) {
  var message = new MessageModel({
    user: req.params.id,
    // recipient:req.body.recipient||'',
    message: req.body.message
  });

  message.save(function(err, message) {
    if (err !== null) {
      return res.json({
        message: "Error when saving message.",
        error: err
      });
    }
    return res.json({
      success: true,
      data: message
    });
  });
});
app.put("/api/messages/:id", function(req, res) {
  let message = req.query.message;
  MessageModel.updateOne(
    { _id: req.params.id },
    {
      message
    },
    function(err, result) {
      if (err) {
        return res.json({
          message: "Error when update message.",
          error: err
        });
      }
      return res.json({
        data: {
          isUpdate: result
        }
      });
    }
  );
});

app.delete("/api/messages/:id", function(req, res) {
  MessageModel.deleteOne({ _id: req.params.id }, function(err, result) {
    if (err) {
      return res.json({
        message: "Error when delete message.",
        error: err
      });
    }
    return res.json({
      success: true,
      data: {
        isDeleted: true
      }
    });
  });
});

io.on("connection", function(socket) {
  console.log("a user connected");

  socket.on("push message", function(msg) {
    io.emit("push message", msg); // dispatch the message to everyone
    console.log("message: " + msg.message);
    console.log("message: " + msg.user);

    // TODO: Save the message in the database
    var user = msg.user;
    var message = msg.message;
    var message = new MessageModel({
      user: user,
      message: message
    });
    message.save(function(err, message) {
      if (err !== null) {
        console.log("something went wrong err", err);
      } else {
        console.log("we just saved the new student ", message);
      }
    });
  });
});
// users
app.post("/api/signup", uploadProfile.single("photo"), function(req, res) {
  let photo = "";
  console.log(req);

  if (req.file !== undefined) {
    photo = `uploads/profile/${req.file.filename}${getExtension(
      req.file.mimetype
    )}`;
    var newImage = `public/uploads/profile/${req.file.filename}${getExtension(
      req.file.mimetype
    )}`;
    fs.rename(req.file.path, newImage, function() {
      console.log("picture has been uploading!");
    });
  } else {
    photo = "";
  }
  console.log(req.file);
  UserModel.register(
    new UserModel({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      birthday: req.body.birthday,
      phone: req.body.phone,
      photo: photo || "",

      // L'inscription créera le token permettant de s'authentifier auprès de la strategie `http-bearer`
      token: uid2(16) // uid2 permet de générer une clef aléatoirement. Ce token devra être regénérer lorsque l'utilisateur changera son mot de passe
    }),

    req.body.password, // Le mot de passe doit être obligatoirement le deuxième paramètre transmis à `register` afin d'être crypté

    function(err, user) {
      if (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
      } else {
        res.json({
          user
        });
      }
    }
  );
});

app.post("/api/login", function(req, res, next) {
  console.log("req.bodys",req.body)
  passport.authenticate("local", { session: false }, function(err, user, info) {
    if (err) {
      res.status(400);
      return next(err.message);
    }
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.log("user", user);
    res.json({
      user
    });
  })(req, res, next);
});

app.get("/api/users/:id", function(req, res, next) {
  console.log("index.js /api/users/:id");
  passport.authenticate("bearer", { session: false }, function(
    err,
    user,
    info
  ) {
    console.log("index.js /api/users/:id err", err);
    console.log("index.js /api/users/:id user", user);
    console.log("index.js /api/users/:id info", info);
    if (err) {
      res.status(400);
      return next(err.message);
    }
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    UserModel.findById(req.params.id)
      .then(function(user) {
        if (!user) {
          res.status(404);
          return next("User not found");
        }
        return res.json(user);
      })
      .catch(function(err) {
        res.status(400);
        return next(err.message);
      });
  })(req, res, next);
});


app.listen(port, function() {
  console.log("Server started on port:", port);
});
