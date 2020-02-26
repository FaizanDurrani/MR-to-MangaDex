let combinedList = [];

const saveData = (blob, fileName) => {
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";

    let url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
};

const exportMDList = () => {
    let mdList = [];
    combinedList.forEach(x => {
        if (!x['md']) return;

        return mdList.push({comic_id: `${x['md']['id']}`});
    });
    let blob = new Blob([JSON.stringify(mdList)], {type: "text/plain; encoding=utf8"});
    saveData(blob, 'MD_EXPORT_' + Date.now() / 1000 + '.json');
};

const exportMRList = () => {
    let blob = new Blob([JSON.stringify(combinedList.map(x => x['mr']), null, 4)], {type: "text/plain; encoding=utf8"});
    saveData(blob, 'MR_EXPORT_' + Date.now() / 1000 + '.json');
};

const exportList = async () => {
    let email = $('#email').val();
    let pass = $('#pass').val();

    $('#box').remove();
    $('#loader').fadeIn(500);

    try {
        const list = await app.exportMRList(email, pass, true);
        if (list === undefined || list === null) {
            console.log("Could not get MR List");
            return;
        }

        console.log(`Found ${list.mangas.length} manga on MR`);

        $('#login').fadeOut(500);

        combinedList = (await app.mrListToMD(list))['results'];

        $('#loader').fadeOut(500);
        $('#list').fadeIn(500);

        for (let item of combinedList) {
            if (!item['md']) {
                $('#mr_list').append(`
                            <div class="ui fluid horizontal card">
                                <div class="manga-image" style="background-image: url('${item['mr']['thumbnail']}')" />
                                <div class="content manga-desc">
                                    <h3 class="header">${item['mr']['name']}</h3>
                                    <div class="description">${item['mr']['description'].trim()}</div>
                                </div>
                            </div>`);

                $('#md_list').append(`
                            <div class="ui fluid horizontal card">
                                <div class="manga-image" style="background-image: url('http://placehold.jp/cccccc/8f8f8f/300x450.png?text=Manga%20Not%20Found')" />
                                <div class="content manga-desc">
                                    <h3 class="header">Manga not found</h3>
                                    <div class="description">The manga <b>${item['mr']['name']}</b> could not be found on MangaDex</div>
                                </div>
                            </div>`);
            } else {
                Object.keys(item).forEach(key => {
                    if (key === "mr") {
                        $('#mr_list').append(`
                                    <div class="ui fluid horizontal card">
                                        <div class="image manga-image" style="background-image: url('${item['mr']['thumbnail']}')" />
                                        <div class="content manga-desc">
                                            <h3 class="header">${item['mr']['name']}</h3>
                                            <div class="description">${item['mr']['description'].trim()}</div>
                                        </div>
                                    </div>
                                `);
                    } else {
                        $('#md_list').append(`
                                    <div class="ui fluid horizontal card">
                                        <div class="image manga-image" style="background-image: url('https://mangadex.org/images/manga/${item['md']['id']}.large.jpg?1537907572')" />
                                        <div class="content manga-desc">
                                            <h3 class="header">${item['md']['titles'][0]}</h3>
                                            <div class="description">${item['md']['description'].trim()}</div>
                                        </div>
                                    </div>
                                `);
                    }
                });
            }
        }
    } catch (e) {
        console.error(e);
    }
}