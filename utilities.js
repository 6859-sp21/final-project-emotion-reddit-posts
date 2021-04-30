function toPage(n) {
    document.getElementById("mainPage").style.marginLeft = (n - 1) * -100 + "vw";
    
    for (let i = 1; i < 4; i++) {
        if (i == n) {
            document.getElementById("button" + i).className = "pageButton active";
        } else {
            document.getElementById("button" + i).className = "pageButton";
        }
    }
}