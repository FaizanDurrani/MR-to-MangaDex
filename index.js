const app = require("./lib/app");
const fs = require("fs");
const utils = require("./lib/Functions");

let email = process.argv[2];
let password = process.argv[3];

if (email.trim() === "" || password.trim() === "") {
    console.log("NEED EMAIL AND PASSWORD FOR MR; FORMAT: node . <email> <password>");
    process.exit();
} else {
    app.exportMRList(email, password).then(backup => {
        fs.writeFile(`./MangaLogs/MR-Mangas.json`, JSON.stringify(backup, null, 4), null, (err) => {
            if (err) utils.error(err); // Stop file write if there is an error
    
            utils.log(`Complete!`)
        });
    });
}