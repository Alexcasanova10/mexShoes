const mongoose = require('mongoose');
const dotenv= require('dotenv');

dotenv.config();

const connectDb = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Conectado a MongoDb');

    }catch(err){
        console.error("Error al conectar a BD es " + err);
        process.exit(1)
    }
}
//password de mongo U9OhCGjDdLtHcgV5

module.exports = connectDb;