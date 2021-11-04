const path = require('path');

async function compare() {
    const fs = require('fs');
    // Define your file paths here
    const files = ['de.json', 'en.json', 'ru.json', 'tr.json', 'zh-tw.json', 'zh.json']
    const path = "../locales/";
    // Read contents and parse JSON
    const filesWithKeys = files.map(f => ({
        name: f,
        content: JSON.parse(fs.readFileSync(`${path}${f}`, 'utf8'))
    }));

    // Gather all the keys used in all files in one array
    const allKeys = filesWithKeys.map(f => Object.keys(f.content)).flat();

    // Find the missing keys by file
    const missingKeysByFile = filesWithKeys.map(f => ({
        name: path + f.name,
        missingKeys: allKeys.filter(k => !(k in f.content))
    })).filter(f => f.missingKeys.length > 0);

    // Print the result
    // missingKeysByFile.forEach(f => {
    //     console.log(`File "${f.name}" is missing keys [ ${f.missingKeys.join(' ')} ]`);
    // });
    return missingKeysByFile
}

async function createHTML() {
    try {
        let table = "";
        table += "<table style='witdh:100%;' ><tr><td colspan='3' style='background-color:#9e9e9e; font-size:16px; text-align: center;'>Tables of Missing Keys</td></tr>"
        table += "<tr><td style='text-align: left; width:auto;'>File</td><td style='text-align: left; width:auto;'>Key</td><td style='text-align: left; width:auto;'>Input</td></tr>"
        const compareSheet = await compare();
        let template = require("fs").readFileSync(path.join(__dirname, "index.html")).toString();
        for (let fileIndex = 0; fileIndex < compareSheet.length; fileIndex++) {
            for (let keyIndex = 0; keyIndex < compareSheet[fileIndex].missingKeys.length; keyIndex++) {
                table += `<tr><td style='text-align: left; width:auto;'>${compareSheet[fileIndex].name}</td><td style='text-align: left; width:auto;'>${compareSheet[fileIndex].missingKeys[keyIndex]}</td><td style='text-align: left; width:auto;'><input type="text" id='${compareSheet[fileIndex].name}#/#${compareSheet[fileIndex].missingKeys[keyIndex]}'></td></tr>`
            }
        }

        template = template.replace(/#Table#/g, table);
        template = template.replace(/#data#/g, JSON.stringify(compareSheet));
        return template
    } catch (e) {
        console.log("Error: ", e)
    }
}

async function writeFile(data) {
    const fs = require('fs');
    var mappedData = {};
    var splitKey = "";
    for (const property in data) {
        splitKey = property.split("#/#")
        mappedData[splitKey[0]] = mappedData[splitKey[0]] ? mappedData[splitKey[0]] : [];
        mappedData[splitKey[0]].push({
            key: splitKey[1],
            value: data[property]
        })
    }
    // console.log("mappedData: ", mappedData)
    var json = "";
    for (const proMappedData in mappedData) {
        fs.readFile(`${proMappedData}`, 'utf8', function readFileCallback(err, data) {
            let obj = JSON.parse(data); //now it an object
            for (let index = 0; index < mappedData[proMappedData].length; index++) {
                if (err) {
                    console.log(err);
                } else {
                    if (mappedData[proMappedData][index].value != "") {
                        obj[mappedData[proMappedData][index].key] = mappedData[proMappedData][index].value //add some data
                    }
                }
            }
            console.log("obj", obj)
            json = JSON.stringify(obj); //convert it back to json
            console.log("json: ", json)
            fs.writeFile(`${proMappedData}`, json, 'utf8', function (err) {
                console.log("Error: ", err)
            }); // write it back 
        });
    }

}
module.exports = {
    compare: compare,
    createHTML: createHTML,
    writeFile: writeFile
}