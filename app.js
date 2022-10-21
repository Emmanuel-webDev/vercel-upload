const express = require('express')
const path = require('path');
const cloudinary = require('./cloudinary')
const multer = require('multer')
const upload = multer({storage:multer.diskStorage({})})

const app = express()

app.use(express.static('public'))
app.use('/images',  express.static('images'))
app.use(express.urlencoded({extended: false}))

app.set('views', path.join(__dirname, 'UI'))
app.set('view engine', 'ejs')

const userdb = require('./data/database')

app.get('/', async (req,res)=>{
    const users = await userdb.getDB().collection('users').find().toArray();
    res.render('index', {users : users})
})

app.get('/register', (req,res)=>{
    res.render('profile')
})

app.post('/storedUser', upload.single('img'), async (req,res)=>{
    const uploadedimg = await cloudinary.v2.uploader.upload(req.file.path)

    const userData = req.body;
   await userdb.getDB().collection('users').insertOne({
        name : userData.username,
        imagePath : uploadedimg.secure_url,
        bio : userData.bio
    });

    res.redirect('/')
})

app.post('/del', async (req,res)=>{
await userdb.getDB().collection('users').deleteOne({})
res.redirect('/')
})



userdb.connection().then(()=>{
    app.listen(process.env.PORT || 3000, ()=>{
        console.log('App running and listening on port 3000')
    })
})
