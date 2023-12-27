/// <reference path="jquery-3.6.2.js" />
const callAPI = "assets/cryptoAPI.json" // "https://api.coingecko.com/api/v3/coins/"
// const liveCoin = `https://min-api.cryptocompare.com/data/price?fsym=${coin.symbol}&tsyms=USD`
$(() => {
    let coins = []
    // Hide and show sections
    handleCoins()
    $("section").hide()
    $("#homeSection").show()
    $("a").on("click", function () {
        const dataSection = $(this).attr("data-section")
        $("section").hide()
        $("#" + dataSection).show()})
    // Fetching coins from API
    async function handleCoins() {
        try {
            coins = await getJSON(callAPI)
            for (const coin of coins) { //Initiate follow to false
                coin.follows=false   
            }
            console.log(coins)
            displayCoins(($("#homeSection")),coins)} 
        catch (error){
            alert(error.message)}}

    function getJSON(url){
        return new Promise((resolve, reject) => {
            $.ajax({
                url,
                success: data => {
                    resolve(data)},
                error: err => {
                    reject(err)}})})}
    // Check which coind are favorites
    let followingCoins = 0
    let favCoins = []
        $("#homeSection").on("click",".following", function (){
        console.log(this.parentElement)
            if (followingCoins<=5){
                if (this.value==="notClicked"){
                followingCoins++
                    if (followingCoins===6){
                        const  popup = document.getElementById("myPopup")
                        popup.classList.toggle("show")
                        addToFav(this)
                        displayCoins(($("#popupCoins")), favCoins)
                        followingCoins--}
                    else{
                        this.innerHTML= "🤑"
                        this.value="clicked"
                        addToFav(this)
                        }
            }
        }
            else if (this.value==="clicked"){
                this.innerHTML= "🙂"
                followingCoins--
                this.value="notClicked"}
            }
        )
// Add coin to favorites coins array
        function addToFav(coin){
            for(let i=0;i<coins.length;i++)
            {
                if ((coin.parentElement.innerHTML).includes(coins[i].id))
                    {
                    coins[i].follows=true
                    favCoins.push(coins[i])
                    }
            }
        }
// closing popup button
        $("#myPopup").on("click","#closePopup", function (){
            const  popup = document.getElementById("myPopup")
            popup.classList.toggle("show")})

// "Printing" coins to screen
    function displayCoins(displayArea, coins) {
        let content = ""
        for (const coin of coins) {
            const card = createCard(coin)
            content += card}
        $(displayArea).html(content)}

// create card for each coin
    function createCard(coin) {
        const card = `
        <div class="card">
            <span>${coin.id}</span><br>
            <span>${coin.symbol}</span><br>
            <img src="${coin.image.small}"/><br>
            <button class="showCoin btn btn-info" id="${coin.id}">More Info</button>
            <div class="coinInfo" id="${coin.id}Info"></div>
            <button class="following" value="notClicked">🙂</button>
        </div>`
        return card}
// store coins data in session
    function StoreCoinInfo(coin) {
        const time = new Date().getTime()
        coinInfo = {
            usd: coin.market_data.current_price.usd,
            eur: coin.market_data.current_price.eur,
            ils: coin.market_data.current_price.ils,
            time: time}
        const json = JSON.stringify(coinInfo)
        sessionStorage.setItem(`coinInfo${coin.id}`, json)}
    // check if data is stored for 2 minutes
    function timeCheck(coin){
        const nowTime = new Date().getTime()
        restCoin = JSON.parse(sessionStorage.getItem(`coinInfo${coin}`))
        restCoin = parseInt(restCoin.time)
        if ((nowTime - restCoin) > 120000)
        sessionStorage.removeItem(`coinInfo${coin}`)}
    // Displaying more info about coins: NIS, EURO, USD
    $("#homeSection").on("click", ".card > .showCoin", async function () {
        const coinId = $(this).attr("id")
        const infoDiv = document.getElementById(`${coinId}Info`)
        if (sessionStorage.getItem(`coinInfo${coinId}`)===null) {
            const coin = await getMoreInfo(coinId)
            const content = `
            ${coin.market_data.current_price.usd}$<br>
            ${coin.market_data.current_price.eur}€<br>
            ${coin.market_data.current_price.ils}₪<br>`
            StoreCoinInfo(coin)
            displayAndHide(infoDiv, content)}
        else {
            const storedData = sessionStorage.getItem(`coinInfo${coinId}`)
            const coinInfo = JSON.parse(storedData)
            const content = `
            ${coinInfo.usd}$<br>
            ${coinInfo.eur}€<br>
            ${coinInfo.ils}₪<br>`
            displayAndHide(infoDiv, content)}
        timeCheck(coinId)}
        )
    // Open and close "more Info"
    function displayAndHide(infoDiv, content) {
        if (infoDiv.style.display !== "block") {
            infoDiv.innerHTML = content
            infoDiv.style.display = "block"}
        else if (infoDiv.style.display === "block")
            $(infoDiv).hide(1000)}
// fetching "more Info" data
    async function getMoreInfo(coinId) {
        const coin = await getJSON("https://api.coingecko.com/api/v3/coins/"+coinId)
        return coin
    }
// live coins search
    $("input[type=search]").on("keyup", function () {
        const textToSearch = $(this).val().toLowerCase()
        if (textToSearch === "") 
            displayCoins(($("#homeSection")),coins)
        else {
            const filteredCoins = coins?.filter(coin => coin.symbol.includes(textToSearch))
            displayCoins(($("#homeSection")), filteredCoins)}})
})