const mongoose = require('mongoose');

// const db = () => {
//     mongoose.connect('mongodb://127.0.0.1:27017/gstar')
//         .then(() => {
//             console.log("MongoDB local connected");
//         })
//         .catch((err) => {
//             console.error(err);
//         });
// };

const db = () => {
       mongoose.connect('mongodb+srv://gstar:Gstar1456@gstar.pjdqitc.mongodb.net/?retryWrites=true&w=majority&appName=Gstar')
        .then(() => {
            console.log("MongoDB server connected");
        })
        .catch((err) => {
            console.error("MongoDB connection error:", err);
        });
};

module.exports = db;