const express = require('express')
const multer = require('multer')
const cors = require('cors')
const cloudinary = require('cloudinary');
const res = require('express/lib/response');
const { Pool } = require('pg')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const app = express()
const port = process.env.PORT || 3001
const upload = multer({ dest: 'uploads/' })

let pool;
if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })
} else {
  pool = new Pool({
    database: 'my_database',
    password: 'test'
  })
}

const clientSideURL = 'http://localhost:3000'
app.use(cors({ origin: clientSideURL }))

app.use(express.urlencoded({ extended: true }))

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

app.post('/upload_logo', upload.single('logo'), (req, res) => {
  cloudinary.v2.uploader.upload(req.file.path, { folder: 'if_you_have_a_folder' }, (err, img) => {
    pool
      .query("INSERT INTO table_name(title, description, img_url) VALUES ($1, $2, $3);", [req.body.title, req.body.description, img.secure_url])
      .then(() => res.redirect(clientSideURL))
  })
})
