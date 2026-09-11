function toggleCard(cardId) {
    const card = document.getElementById(cardId);
    const details = card.querySelector(".Additional-details");

    if (details.style.display === "none" || details.style.display === "") {
        details.style.display = "block";
    } else {
        details.style.display = "none";
    }
}