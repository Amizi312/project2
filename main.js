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
    

    $("#homeSection").on("click",".card > button", async function () {
        const coinId = $(this).attr("id") 
        const coin = await getMoreInfo(coinId)
        const infoDiv = document.getElementById(`${coinId}Info`)
        const content = `
        ${coin.market_data.current_price.usd}$<br>
        ${coin.market_data.current_price.eur}€<br>
        ${coin.market_data.current_price.ils}₪<br>`        
        if(infoDiv.style.display!=="block")
            {infoDiv.innerHTML = content
                infoDiv.style.display="block"}
        else if(infoDiv.style.display==="block")
                $(infoDiv).hide(1000)
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