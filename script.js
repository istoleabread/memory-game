const Wrapper = document.querySelector(".imgWrapper");
const Score = document.querySelector("#score");

class GameArena {
    static selectedCard = "";
    static score = 0;

    constructor(rows, columns) {
        if (rows % 2 !== 0 && columns % 2 !== 0) {
            // for odd sqaure, even number of combinations isn't possible (eg: 3x3, 5x5);
            rows = 4;
            columns = 5;
        }
        this.rows = rows;
        this.columns = columns;
        this.cardObjects = [];
    }

    init() {
        this.createArena();
        this.addListeners();
        document.querySelector(".game").style.transform = "translate(0%)";
        document.querySelector(".game").style.opacity = 1;
    }

    createArena() {
        const numberOfCards = this.rows * this.columns;
        const allImages = this.shuffledCards(numberOfCards);
        let imgIndex = 0;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < this.rows; i++) {
            const rowBox = document.createElement("div");
            rowBox.className = "singleRow";
            for (let j = 0; j < this.columns; j++) {
                const card = new SingleCard(`id${i}${j}`);
                rowBox.appendChild(card.createCard(allImages, imgIndex++));
                this.cardObjects.push(card);
            }
            fragment.appendChild(rowBox);
        }
        Wrapper.appendChild(fragment);
        console.log(this.cardObjects);
    }

    shuffledCards(total) {
        let allImages,
            imagesRequired = total / 2;

        // create an array containing "total" number of elements
        if (imagesRequired <= images.length) {
            allImages = images.slice(0, imagesRequired).concat(images.slice(0, imagesRequired));
        } else {
            // if number of cards/2 are more than existing images, duplicate the images
            allImages = images;
            let arrayLeft = imagesRequired - allImages.length;
            while (arrayLeft >= images.length) {
                allImages = allImages.concat(images);
                arrayLeft = imagesRequired - allImages.length;
            }
            allImages = allImages.concat(images.slice(0, arrayLeft));
            allImages = allImages.concat(allImages); // Duplicate all images to itself as we'll be needing 2 images to match
        }

        // Shuffle starts here
        for (let i = total - 1; i >= 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
        }
        return allImages;
    }

    addListeners() {
        Wrapper.addEventListener("click", (ev) => {
            this.handleClick(ev);
        });
    }

    handleClick(ev) {
        const parent = ev.target.closest(".imageDiv");
        // If the card is already removed, dont do anything
        if (!parent || parent.dataset.uid === "null") {
            return;
        }

        const id = parent.id;
        // Get the clicked card from objects array
        const clickedObject = this.cardObjects.find((obj) => {
            return obj.id === id;
        });

        clickedObject.handleFlip();
        if (!GameArena.selectedCard) {
            GameArena.selectedCard = clickedObject;
            return;
        }

        // If card is already clicked, dont do anything
        if (GameArena.selectedCard.id === clickedObject.id) {
            clickedObject.handleFlip();
            return;
        }

        // Match the two cards
        const matched = clickedObject.checkCards(GameArena.selectedCard);
        if (matched) {
            this.updateScore();
            this.emptyBoxesFromDOM(GameArena.selectedCard.id, clickedObject.id);

            // Removing matched cards from objects list
            this.cardObjects = this.cardObjects.filter((obj) => {
                return obj.id != GameArena.selectedCard.id && obj.id != clickedObject.id;
            });
            console.log(this.cardObjects);
        } else {
            const secondObj = GameArena.selectedCard;
            setTimeout(() => {
                clickedObject.handleFlip();
                secondObj.handleFlip();
            }, 800);
        }
        if (!this.cardObjects.length) {
            setTimeout(this.gameOver, 800);
        }
        GameArena.selectedCard = null;
    }

    emptyBoxesFromDOM(id1, id2) {
        const parent1 = document.getElementById(id1);
        const parent2 = document.getElementById(id2);
        const firstImage = parent1.querySelector(".back");
        const secondImage = parent2.querySelector(".back");
        setTimeout(() => {
            parent1.removeChild(firstImage);
            parent2.removeChild(secondImage);
            parent1.dataset.uid = parent2.dataset.uid = null;
        }, 1000);
    }

    updateScore() {
        Score.textContent = ++GameArena.score;
    }

    gameOver() {
        console.log("Game Over!");
        document.querySelector(".game h1").innerHTML = "You've found all the cards!";
        const cards = document.querySelectorAll(".imageDiv");
        cards.forEach((card) => {
            card.style.backgroundColor = "greenyellow";
        });
    }
}

//
//
// Single Card's class
class SingleCard {
    constructor(id) {
        this.isFlipped = false;
        this.id = id;
        this.uid = "";
    }

    createCard(imgArray, imgId) {
        const parentDiv = document.createElement("div");
        const frontDiv = document.createElement("div");
        const backDiv = document.createElement("div");

        parentDiv.className = "imageDiv";
        frontDiv.className = "box front";
        backDiv.className = "box back";
        parentDiv.id = this.id;

        const img = document.createElement("img");
        img.className = "singleImage";
        img.src = imgArray[imgId].url;
        parentDiv.dataset.uid = imgArray[imgId].id;
        backDiv.appendChild(img);
        parentDiv.appendChild(frontDiv);
        parentDiv.appendChild(backDiv);

        this.uid = imgArray[imgId].id;
        return parentDiv;
    }

    handleFlip() {
        document.getElementById(this.id).style.transform = this.isFlipped
            ? "rotateY(0deg)"
            : "rotateY(180deg)";
        this.isFlipped = !this.isFlipped;
    }

    checkCards(obj) {
        return this.uid === obj.uid;
    }
}

//
//
// Initializing game on user click
class GameInitialize {
    init() {
        document.getElementById("gameStart").addEventListener("click", () => {
            this.getInput();
        });
    }

    getInput() {
        const landingPage = document.getElementById("landingPage");
        const inputPopup = document.getElementById("popup");
        landingPage.style.opacity = "0%";
        landingPage.style.scale = 0.6;
        inputPopup.style.transform = "translate(-50%, -50%)";
        inputPopup.style.opacity = 1;
        this.checkInput(inputPopup);
    }

    checkInput(elem) {
        const startBtn = document.getElementById("startBtn");
        elem.addEventListener("input", (ev) => {
            this.validateCount(ev.target);
        });

        startBtn.addEventListener("click", () => {
            this.createArena(elem);
        });
    }

    validateCount(elem) {
        if (!elem.value) {
            return;
        }
        if (elem.value > 10) {
            elem.value = 10;
        } else if (elem.value < 1) {
            elem.value = 1;
        }
    }

    showError(msg) {
        const error = document.querySelector(".errorMsg");
        if (msg) {
            error.innerHTML = `<span class="error">Error:</span> ${msg}`;
        } else {
            error.innerHTML = "";
        }
    }

    createArena(elem) {
        const rows = document.getElementById("rows").value;
        const columns = document.getElementById("columns").value;
        if ((rows * columns) % 2 !== 0) {
            this.showError("Product of rows and columns cannot be odd!");
            return;
        }
        this.showError("");
        const arena = new GameArena(rows, columns);
        arena.init();
        elem.style.transform = "translateY(100%)";
        elem.style.opacity = 0.3;
    }
}

const gameObj = new GameInitialize();
gameObj.init();
