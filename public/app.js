const wordInput = document.querySelector('#word-input');
const nameContainer = document.querySelector('#name-container');
const resultLabel = document.querySelector('#result');
const resultContainer = document.querySelector('#result-container');
const leftArrow = document.querySelector('#left-arrow');
const rightArrow = document.querySelector('#right-arrow');

const overlay = document.querySelector('#overlay');
const searchBoxDiv = document.querySelector('#search-box');
const hideSearch = document.querySelector('#hide-search');
const searchInput = document.querySelector('#search-input');
const searchResultDiv = document.querySelector('#search-results');

const elements = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr',
    'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Uut', 'Fl', 'Uup', 'Lv', 'Uus', 'Og']

function getWordList() {
    return new Promise((resolve, reject) => {
        $.get('wordlist', (words) => {
            resolve(words)
        })
    })
}

function getCandidates(word, elements, start) {

    let candidates = [];
    word = word.toLowerCase();

    elements.forEach(element => {
        if (word.startsWith(element.toLowerCase(), start)) {
            candidates.push(element);
        }
    });

    return candidates
}


function findElements(word, phrase, elements, completed) {
    let start = phrase.join('').length;
    candidates = getCandidates(word, elements, start);

    candidates.forEach(candidate => {
        new_phrase = [...phrase]
        new_phrase.push(candidate)
        if (new_phrase.join('').length == word.length) {
            completed.push(new_phrase);
        } else {
            findElements(word, new_phrase, elements, completed)
        }
    });
}

async function addElement(symbol) {

    await fetch(`https://neelpatel05.pythonanywhere.com/element/symbol?symbol=${symbol}`)
        .then(response => response.json())
        .then(element => {
            // console.log(data.groupBlock)

            const elementDiv = document.createElement('div');
            elementDiv.classList.add('element')
            elementDiv.classList.add(element.groupBlock.replace(/\s/g, "-"))

            const atomicNumber = document.createElement('p');
            atomicNumber.classList.add('atomic-number');
            atomicNumber.innerText = element.atomicNumber;

            const elementInfoDiv = document.createElement('div');
            elementInfoDiv.classList.add('element-info');

            const symbolTitle = document.createElement('h3');
            symbolTitle.innerText = symbol;

            const name = document.createElement('p');
            name.classList.add('name');
            name.innerText = element.name;

            const atomicMass = document.createElement('p');
            atomicMass.classList.add('atomic-mass');
            atomicMass.innerText = element.atomicMass.slice(0, 5);

            elementInfoDiv.appendChild(symbolTitle)
            elementInfoDiv.appendChild(name)
            elementInfoDiv.appendChild(atomicMass)

            elementDiv.appendChild(atomicNumber)
            elementDiv.appendChild(elementInfoDiv)

            elementDiv.addEventListener('click', (e) => {
                // Show popup with info about element
                let url = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=${element.name}&origin=*`;

                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        let extract = data['query']['pages'];
                        extract = extract[Object.keys(extract)[0]].extract;

                        let wikiUrl = `https://en.wikipedia.org/wiki/${element.name}`;
                        let htmlContent = `<p>${extract.slice(0, 700)}...</p><br><a href="${wikiUrl}" target="_blank">Read more on Wikipedia</a>`;

                        Swal.fire({
                            title: element.name,
                            html: htmlContent,
                            width: 700,
                            padding: 30
                        })

                    })
            })

            nameContainer.appendChild(elementDiv)
        })

}

async function displayElementName(elementList, index = 0) {
    await addElement(elementList[index]).then(() => {
        index++
        if (index < elementList.length) {
            displayElementName(elementList, index)
        } else {
            // Fade in elements
            nameContainer.classList.add('visible');
        }
    })
}

function changeElementName(elementArray, timeout) {
    nameContainer.classList = '';

    setTimeout(() => {
        nameContainer.innerHTML = '';
        displayElementName(elementArray)
        displayArrows()
    }, timeout)
}

function displayInfo(info, found = false) {
    resultLabel.innerText = info;
    resultContainer.classList.add('visible');

    if (found) {
        resultContainer.classList.add('found');
    } else {
        resultContainer.classList.add('not-found');
    }
}

function displayArrows() {
    if (elementNameArray) {
        // Display more arrows 
        if (currentNameIndex < elementNameArray.length - 1) {
            rightArrow.classList.add('active');
        } else {
            rightArrow.classList.remove('active');
        }

        if (currentNameIndex > 0) {
            leftArrow.classList.add('active');
        } else {
            leftArrow.classList.remove('active');
        }
    }
}

let elementNameArray = null;
let currentNameIndex = null;
let wordList = []
getWordList().then((words) => {
    wordList = words
})

wordInput.addEventListener('keyup', (e) => {
    if (e.key == 'Enter') {
        choice = wordInput.value.toLowerCase()

        completed = Array()
        findElements(choice, [], elements, completed)

        let timeout = 0 // wait no seconds

        if (nameContainer.classList.contains('visible')) {
            nameContainer.classList = '';
            timeout = 500 // wait
        }

        resultContainer.classList = '';
        resultLabel.innerText = '';

        if (completed.length > 0) {
            // Save all current version
            elementNameArray = completed;
            currentNameIndex = 0;

            let infoText = (completed.length == 1) ? '1 combination found!' : `${completed.length} combinations found!`;
            displayInfo(infoText, found = true);
            displayArrows()

            setTimeout(() => {
                nameContainer.innerHTML = '';
                displayElementName(completed[0])
            }, timeout)
        } else {
            displayInfo('Sorry, no combinations found. Try again.');
        }

        wordInput.value = ''
    }
});

rightArrow.addEventListener('click', () => {
    // Set new completed
    if (elementNameArray) {
        currentNameIndex = (currentNameIndex + 1) % elementNameArray.length;
        changeElementName(elementNameArray[currentNameIndex], 500)
    }
})

leftArrow.addEventListener('click', () => {
    // Set new completed
    if (elementNameArray) {
        currentNameIndex = (currentNameIndex - 1) % elementNameArray.length;
        changeElementName(elementNameArray[currentNameIndex], 500)
    }
})

searchBoxDiv.addEventListener('click', (e) => {
    $('#search-pane').toggleClass('hidden');
    $('#overlay').toggleClass('hidden');
})

hideSearch.addEventListener('click', (e) => {
    $('#search-pane').toggleClass('hidden');
    $('#overlay').toggleClass('hidden');
})

overlay.addEventListener('click', (e) => {
    if (!overlay.classList.contains('hidden')) {
        $('#search-pane').toggleClass('hidden');
        $('#overlay').toggleClass('hidden');
    }
})

searchInput.addEventListener('keyup', (e) => {
    // if (e.key != 'Enter') { return }

    // Reset search result div
    searchResultDiv.innerHTML = '';

    // Get the string the user search for
    let searchString = searchInput.value.toLowerCase();
    if (searchString == '') { return }

    // Find all words starting with the search and check for periodic compatability
    wordList.forEach(word => {
        if (word.startsWith(searchString)) {
            completed = Array();
            findElements(word, [], elements, completed);
            if (completed.length > 0) {
                let wordP = document.createElement('p')
                wordP.innerText = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); // capitalize first letter of word

                searchResultDiv.appendChild(wordP)
            }
        }
    })
})



