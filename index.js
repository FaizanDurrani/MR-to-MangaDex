const fs = require('fs'); // fs to write the Tachi JSON
const utils = require('./Functions'); // Logging utils
const request = require('request'); // Request to make request to the mangarock API

let email = process.argv[2];
let password = process.argv[3];

if (email.trim() === "" || password.trim() === "") {
    console.log("NEED EMAIL AND PASSWORD FOR MR; FORMAT: node . <email> <password>");
    process.exit();
} else {

    let tachiObj = {
        "mangas": []
    };

    let opt1 = {
        'method': 'POST',
        'url': 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyCFJPh6357HhIID3SgeRam2Cv6n139ymig',
        'headers': {
            'Content-Type': 'application/json',
            'Referer': 'https://mangarock.com/account/login'
        },
        body: JSON.stringify({ "email": `${email}`, "password": `${password}`, "returnSecureToken": true })
    };

    /* Sign in request */
    request(opt1, function (err, response) {
        if (err) return utils.error(err); // Stop request if there is an error

        let sanatized = JSON.parse(response.body);

        let opt2 = {
            'method': 'POST',
            'url': 'https://graphql.mangarock.io/graphql',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': sanatized['idToken']
            },
            body: JSON.stringify({
                "operationName": "listUserReadingHistoryByUpdatedTimeRevised",
                "variables": {
                    "limit": 100000,
                    "updatedAt": "1970-01-01T00:00:00.000Z",
                    "nextToken": ""
                },
                "query": "query listUserReadingHistoryByUpdatedTimeRevised($updatedAt: AWSDateTime, $limit: Int, $nextToken: String) {\n  listUserReadingHistoryByUpdatedTimeRevised(updatedAt: $updatedAt, nextToken: $nextToken, limit: $limit) {\n    items {\n      oid\n      updatedAt\n      lastRead\n      lastReadPage\n      lastReadChapterOID\n      showInRecent\n      __typename\n    }\n    nextToken\n    __typename\n  }\n}\n"
            })
        };

        /* Get users manga request */
        request(opt2, function (err, res) {
            if (err) return utils.error(err); // Stop request if there is an error

            let userManga = new Map(Object.entries(JSON.parse(res.body).data['listUserReadingHistoryByUpdatedTimeRevised'].items)); // Filters the result body to just the list of manga


            let idObj = {}; // Object for request OIDs

            let mangaList = []; // Array for user manga

            for (let i of userManga) {
                let entry = i[1]; // Current manga in mangalist

                idObj[entry['oid']] = 0; // Adds new OID with value of 0 for the request

                let oidObject = {}; // Object for mangalist OIDs

                oidObject['oid'] = entry['oid']; // Sets oidObject oid to the current manga OID
                oidObject['lastReadPage'] = '0'; // Placeholder 0 for lastReadChapterOID
                if (entry['lastReadPage'] !== null) // If the current manga has a lastReadChapterOID then set the oidObject lastReadChapterOID to that
                    oidObject['lastReadPage'] = entry['lastReadPage'];

                mangaList.push(oidObject); // Push oidObject into the mangaList for later
            }

            let detailObj = { "oids": idObj, "sections": ["basic_info"] }; // Creates an Object with the info the next request needs

            let opt3 = {
                'method': 'POST',
                'url': 'https://api.mangarockhd.com/query/web401/manga_detail',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(detailObj)
            };

            /* Get manga info request */
            request(opt3, function (err, res) {
                if (err) return utils.error(err); // Stop request if there is an error

                //console.log(res.body);
                let mangaInfo = new Map(Object.entries(JSON.parse(res.body).data)); // Parse request to JSON and only save the data

                for (let entry of mangaInfo) {
                    let info = entry[1]; // Sets info to the second item in the entry array

                    let basicInfo = info['basic_info']; // Sets basic info
                    if (!basicInfo.hasOwnProperty('name')) continue; // If basic info does not contain "name" skip this loop iteration
                    let currOID = info['default']['oid']; // Sets the current manga OID

                    let lastRead = 0; // Sets last read

                    for (let manga of mangaList) {
                        if (manga['oid'] !== currOID) continue; // If the current info manga OID does not equal the current manga list OID, skip this loop iteration

                        if (manga['lastReadPage']) // If the manga object contains "lastReadChapterOID", set lastRead to that
                            lastRead = manga['lastReadPage'];

                        tachiObj.mangas.push({ // Push a completed manga object to the tachiObj
                            name: basicInfo['name'],
                            thumbnail: basicInfo['thumbnail'],
                            lastReadChapter: lastRead,
                            alias: basicInfo['alias']
                        })
                    }
                }

                fs.writeFile(`./MangaLogs/${Date.now()}-tachibackup.json`, JSON.stringify(tachiObj, null, 4), null, (err) => {
                    if (err) utils.error(err); // Stop file write if there is an error

                    utils.log(`Complete!`)
                })
            });

        });
    });
}