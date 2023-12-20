/// <reference path="jquery-3.6.2.js" />

$(() => {
    let coins = []
    handleCoins()
    $("section").hide()
    $("#homeSection").show()
    $("a").on("click", function () {
        const dataSection = $(this).attr("data-section")
        $("section").hide()
        $("#" + dataSection).show()
    })
    
    async function handleCoins() {
        try {
            coins = await getJSON("https://api.coingecko.com/api/v3/coins/")
            displayCoins(coins)
        } catch (error) {
            alert(error.message)
        }
    }

    function getJSON(url) {
        return new Promise((resolve, reject) => {
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
        let followingCoins = 0
           $("#homeSection").on("click",".card > .following", function (){
            if (this.value==="notClicked"){
                if (followingCoins<5){
                this.innerHTML= "🤑"
                followingCoins++
                this.value="clicked"
                alert(`You have ${5-followingCoins} coins left to follow.`)}
                else if (followingCoins===5)
                    alert("You are following 5 coins. To change coins, please remove one or more coins subs.")}
            else if (this.value==="clicked"){
                this.innerHTML= "🙂"
                followingCoins--
                alert(`You have ${5-followingCoins} coins left to follow.`)}
        })
    
    function displayCoins(coins) {
        let content = ""
        for (const coin of coins) {
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
            <button class="showCoin btn btn-info" id="${coin.id}">More Info</button>
            <div class="coinInfo" id="${coin.id}Info"></div>
            <button class="following" value="notClicked">🙂</button>
        </div>`
        return card
    }

    function StoreCoinInfo(coin) {
        const time = new Date().getTime()
        coinInfo = {
            usd: coin.market_data.current_price.usd,
            eur: coin.market_data.current_price.eur,
            ils: coin.market_data.current_price.ils,
            time: time
        }
        const json = JSON.stringify(coinInfo)
        sessionStorage.setItem(`coinInfo${coin.id}`, json)
    }
    
    function timeCheck(coin){
        const nowTime = new Date().getTime()
        restCoin = JSON.parse(sessionStorage.getItem(`coinInfo${coin}`))
        restCoin = parseInt(restCoin.time)
        if ((nowTime - restCoin) > 120000)
        sessionStorage.removeItem(`coinInfo${coin}`)
    }
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
            displayAndHide(infoDiv, content)
        }
        else {
            const storedData = sessionStorage.getItem(`coinInfo${coinId}`)
            const coinInfo = JSON.parse(storedData)
            const content = `
            ${coinInfo.usd}$<br>
            ${coinInfo.eur}€<br>
            ${coinInfo.ils}₪<br>`
            displayAndHide(infoDiv, content)
        }
        timeCheck(coinId)
    })
    function displayAndHide(infoDiv, content) {
        if (infoDiv.style.display !== "block") {
            infoDiv.innerHTML = content
            infoDiv.style.display = "block"
        }
        else if (infoDiv.style.display === "block")
            $(infoDiv).hide(1000)
    }
    async function getMoreInfo(coinId) {
        const coin = await getJSON(`https://api.coingecko.com/api/v3/coins/${coinId}`)
        return coin
    }

    $("input[type=search]").on("keyup", function () {
        const textToSearch = $(this).val().toLowerCase()
        if (textToSearch === "") {
            displayCoins(coins)
        }
        else {
            const filteredCoins = coins?.filter(coin => coin.symbol.includes(textToSearch))
            displayCoins(filteredCoins)
        }
    })
})

