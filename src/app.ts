
import * as utils from './Functions'; // Logging utils
import request from 'request-promise-native'; // Request to make request to the mangarock API
export const mrListToMD = async (list: any) => {

    let opt1 = {
        'method': 'POST',
        'url': 'https://us-central1-mangadexapi.cloudfunctions.net/bulkSearch',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(list.mangas)
    };

    return request(opt1).then(response => {
        let sanatized = JSON.parse(response);
        return sanatized;
    });
};
export const exportMRList = async (email: string, password: string, proxy: boolean = false) => {
    utils.log(`EMAIL: ${email} PASSWORD: ${password}`)

    let exportedList = {
        "mangas": []
    };

    let opt1 = Object.create({});
    if (proxy){
        opt1 = {
            'method': 'POST',
            'url': 'https://us-central1-mangadexapi.cloudfunctions.net/mrLogin',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "email": `${email}`, "password": `${password}`})
        };
    }
    else {
        opt1 = {
            'method': 'POST',
            'url': 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyCFJPh6357HhIID3SgeRam2Cv6n139ymig',
            'headers': {
                'Content-Type': 'application/json',
                'Referer': 'https://mangarock.com/account/login'
            },
            body: JSON.stringify({ "email": `${email}`, "password": `${password}`, "returnSecureToken": true })
        };
    }

    /* Sign in request */
    return request(opt1).then(response => {
        let sanatized = JSON.parse(response);

        let opt2 = {
            'method': 'POST',
            'url': 'https://cors-anywhere.herokuapp.com/https://graphql.mangarock.io/graphql',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': sanatized['token'],
                'Origin': null
            },
            body: JSON.stringify({
                "operationName": "favorites",
                "variables": {},
                "query": "query favorites($updatedAt: AWSDateTime, $nextToken: String) {\n  favorites: listFavoritesByUpdatedTimeWithPaging(updatedAt: $updatedAt, nextToken: $nextToken) {\n    items {\n      oid\n        __typename\n    }\n    __typename\n  }\n}\n"
              })
        };

        /* Get users manga request */
        return request(opt2).then(res => {

            let userManga = JSON.parse(res).data.favorites.items; // Filters the result body to just the list of manga
            

            let idObj = {}; // Object for request OIDs

            let mangaList = []; // Array for user manga

            userManga.forEach( entry => {
                idObj[entry['oid']] = 0; // Adds new OID with value of 0 for the request

                let oidObject = {}; // Object for mangalist OIDs

                oidObject['oid'] = entry['oid'];
                mangaList.push(oidObject); // Push oidObject into the mangaList for later
            });
            let detailObj = { "oids": idObj, "sections": ["basic_info"] }; // Creates an Object with the info the next request needs

            let opt3 = {
                'method': 'POST',
                'url': 'https://cors-anywhere.herokuapp.com/https://api.mangarockhd.com/query/web401/manga_detail',
                'headers': {
                    'Content-Type': 'application/json',
                    'Origin': null
                },
                body: JSON.stringify(detailObj)
            };

            /* Get manga info request */
            return request(opt3).then((res) => {

                //console.log(res.body);
                let mangaInfo = Object.values(JSON.parse(res).data); // Parse request to JSON and only save the data
                
                mangaInfo.forEach(entry => {
                    let info = entry; // Sets info to the second item in the entry array

                    let basicInfo = info['basic_info']; // Sets basic info

                    if (!basicInfo['name']) return; // If basic info does not contain "name" skip this loop iteration

                    let currOID = info['default']['oid']; // Sets the current manga OID

                    mangaList.forEach(manga => {
                        if (manga['oid'] !== currOID) return; // If the current info manga OID does not equal the current manga list OID, skip this loop iteration

                        exportedList.mangas.push({ // Push a completed manga object to the tachiObj
                            name: basicInfo['name'],
                            thumbnail: basicInfo['thumbnail'],
                            description: basicInfo['description'],
                            alias: basicInfo['alias']
                        })
                    })
                });

                return exportedList;
            });

        });
    });

}