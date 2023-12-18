/// <reference path="jquery-3.6.2.js" />

$(()=>{

    let coins = []
    handleCoins()

    $("section").hide()
    $("#homeSection").show()

    $("a").on("click", function() {
        const dataSection = $(this).attr("data-section")
        console.log(dataSection)
        $("section").hide()
        $("#"+dataSection).show()
    })

    async function handleCoins() {
        try {
            coins = await getJSON("https://api.coingecko.com/api/v3/coins/")
            console.log(coins)
            displayCoins(coins)
        } catch (error) {
            alert(error.message)
        }
    }

    function getJSON(url) {
        return new Promise((resolve,reject)=>{
            $.ajax({
                url,
                success: data => {
                    resolve(data)
                },
                error: err => {
                    reject(err)
                }
            })

        })
    }

    function displayCoins(coins) {
        let content = ""
        for(const coin of coins) {
            const card = createCard(coin)
            content += card
        }
        $("#homeSection").html(content)
    }

    function createCard(coin) {
        const card = `
        <div class="card">
            <span>${coin.id}</span><br>
            <span>${coin.symbol}</span><br>
            <img src="${coin.image.small}"/><br>
            <button class="btn btn-info" id="${coin.id}">More Info</button>
            <div class="coinInfo" id="${coin.id}Info"></div>
        </div>`
        return card
    }
    let clickCount = 0;
    let firstClickTime = null;

function checkTime(){
    let currentTime = new Date().getTime();
    if (clickCount === 0){
        firstClickTime = currentTime
        return 0
        }
    if (clickCount === 2) {
        const timeDiff = currentTime - firstClickTime;
        return timeDiff}
    // Increment click count for the next click
    clickCount = (clickCount + 1) % 3
}
    function StoreCoinInfo(coin){
        coinInfo = {
        usd : coin.market_data.current_price.usd,
        eur :coin.market_data.current_price.eur,
        ils : coin.market_data.current_price.ils
        }
        sessionStorage.setItem(`coinInfo${coin.id}`,JSON.stringify(coinInfo))
    }

    $("#homeSection").on("click",".card > button", async function () {
        const coinId = $(this).attr("id") 
        const infoDiv = document.getElementById(`${coinId}Info`)
        if (checkTime()>12000 || checkTime()===0)
        {
            const coin = await getMoreInfo(coinId)
            const content = `
            ${coin.market_data.current_price.usd}$<br>
            ${coin.market_data.current_price.eur}€<br>
            ${coin.market_data.current_price.ils}₪<br>`        
            StoreCoinInfo(coin)
            if(infoDiv.style.display!=="block")
            {infoDiv.innerHTML = content
                infoDiv.style.display="block"}
        else if(infoDiv.style.display==="block")
                $(infoDiv).hide(1000)}
        else
            {
            storedData = sessionStorage.getItem(`coinInfo${coinId}`)
            const coinInfo = JSON.parse(storedData)
            const content = `
            ${coinInfo.usd}$<br>
            ${coinInfo.eur}€<br>
            ${coinInfo.ils}₪<br>` 
            if(infoDiv.style.display!=="block")
            {infoDiv.innerHTML = content
                infoDiv.style.display="block"}
        else if(infoDiv.style.display==="block")
                $(infoDiv).hide(1000)}
    })

    async function getMoreInfo(coinId) {
        const coin = await getJSON(`https://api.coingecko.com/api/v3/coins/${coinId}`)
        return coin
    }

    $("input[type=search]").on("keyup",function(){
        const textToSearch = $(this).val().toLowerCase()
        if(textToSearch === "") {
            displayCoins(coins)
        }
        else {
            const filteredCoins = coins?.filter(coin => coin.symbol.includes(textToSearch))
            displayCoins(filteredCoins)
        }
    })  
})