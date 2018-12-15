const express = require(`express`);
const app = express();
const path = require(`path`);
const multer = require('multer');
const HTTP_PORT = 8080; //TODO: Add Heroku env

app.use(express.static("public"));

const storage = multer.diskStorage({
    destination: "./public/images/",
    filename: function (req, file, cb) {
      // we write the filename as the current date down to the millisecond
      // in a large web service this would possibly cause a problem if two people
      // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
      // this is a simple example.
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  const upload = multer({ storage: storage });

app.get(`/`,(req,res)=>{
    res.sendFile(path.join(__dirname,`/views/index.html`));
})

app.get(`/create`, (req,res)=>{
    res.sendFile(path.join(__dirname,`/views/create.html`));
})

app.post(`/create/new`,upload.single('foodPhoto'),(req,res)=>{
    req.body.filename = req.file.filename;
    console.log(req.body);
    console.log(req.file);
    res.redirect(`/`);
})

app.get(`/temp`, (req,res)=>{
    res.sendFile(path.join(__dirname,`/views/temp.html`));
})

app.listen(HTTP_PORT,()=>{
    console.log(`Listening on ${HTTP_PORT}`);
})