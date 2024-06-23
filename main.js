/// <reference path="jquery-3.6.2.js" />

const callAPI = "assets/cryptoAPI100.json" // "https://api.coingecko.com/api/v3/coins/"
$(() => {
    
    let cryptocurrencies = []
    let coins = []
    // Hide and show sections
    handleCoins()
    $("section").hide()
    $("#homeSection").show()
    // moving between sections
    $("a").on("click", function () {
        const dataSection = $(this).attr("data-section")
        $("section").hide()
        $("#" + dataSection).show()
    }
    )
    // getting coins' details and sending to display.
    async function handleCoins() {
        try {
            $(".d-flex").css("visibility", "visible")
            $("#loader").show()
            coins = await getJSON(callAPI)
            console.log(coins)
            $(".d-flex").css("visibility", "hidden")
            $("#loader").hide()
            displayCoins(("homeSection"), coins)
        }
        catch (error) {
            alert(error.message)
        }
    }
    // Fetching coins from API
    function getJSON(url) {
        return new Promise((resolve, reject) => {
            $(".d-flex").css("visibility", "visible")
            $("#loader").show()
            $.ajax({
                url,
                success: data => {
                    $(".d-flex").css("visibility", "hidden")
                    $("#loader").hide()
                    resolve(data)
                },
                error: err => {
                    reject(err)
                }
            })
        })
    }
    // Creating favorite coins array
    let followingCoins = 0
    let favCoins = []
    $("#homeSection").on("click", ".following", function () {
        const popup = document.getElementById("myPopup")
        // console.log(popup)
        if (followingCoins <= 5) {
            if (this.textContent === `🙂`) { addFavCoin(this) }
            else if (this.textContent === `🤑`) { removeFavCoin(this) }
            if (followingCoins === 6) {
                popup.classList.toggle("show")
                displayCoins(("popupCoins"), favCoins)
            }
        }
        else return
    }
    )
    // Add a coin to Favcoins    
    function addFavCoin(toAdd) {
        toAdd.textContent = `🤑`
        followingCoins++
        favCoins.push(findOriginal(toAdd))
    }
    // Remove a coin from Favcoins (from main screen)
    function removeFavCoin(toRemove) {
        toRemove.textContent = `🙂`
        followingCoins--
        for (const index of favCoins) {
            if (findOriginal(toRemove).id === index.id)
                favCoins.splice(favCoins.indexOf(index), 1)
        }
    }
    // Remove one coin from popup & favCoins
    $("#myPopup").on("click", ".card", function () {
        const popup = document.getElementById("myPopup")
        followingCoins--
        for (const coin of favCoins)
            if ((this.innerHTML).includes(coin.id)) {
                favCoins.splice(favCoins.indexOf(coin), 1)
                document.getElementById(`follow${coin.id}`).textContent = `🙂`
            }
        popup.classList.toggle("show")
    }
    )
    // Finding original coin Index
    function findOriginal(coin) {
        for (let i = 0; i < coins.length; i++) {
            if ((coin.parentElement.innerHTML).includes(coins[i].id))
                return coins[i]
        }
    }
    // closing popup button
    $("#myPopup").on("click", "#closePopup", function () {
        const popup = document.getElementById("myPopup")
        followingCoins--
        document.getElementById(`follow${favCoins[favCoins.length - 1].id}`).textContent = `🙂`
        favCoins.pop()
        popup.classList.toggle("show")
    }
    )
    // scrolling with the popup
    window.onscroll = function() {
        const box = document.getElementById("myPopup")
        const loaderBox = document.getElementById("loaderBox")
        let scroll = window.pageYOffset

        if (scroll < 30) {
            box.style.top = "30px"
            loaderBox.style.top = "30px"
        } else {
            box.style.top = (scroll + 2) + "px" 
            loaderBox.style.top = (scroll + 2) + "px"
        }
      }
    // "Printing" coins to screen
    function displayCoins(displayArea, coins) {
        let card
        let content = ""
        for (const coin of coins) {
            if (displayArea === "homeSection")
                card = createCard(coin)
            else {
                card = `<div class="card">
                    <span>${coin.id}</span><br>
                    <img src="${coin.image}"/><br>
                    </div>`
            }
            content += card
        }
        $("#" + displayArea).html(content)
    }
    // create card for each coin
    function createCard(coin) {
        const card = `
        <div class="card">
            <span>${coin.id}</span><br>
            <span>${coin.symbol}</span><br>
            <img src="${coin.image}"/><br>
            <button class="showCoin btn btn-info" id="${coin.id}">More Info</button>
            <div class="coinInfo" id="${coin.id}Info"></div>
            <button class="following" id="follow${coin.id}">🙂</button>
        </div>`
        return card
    }
    // store coins data in session
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
    // check if data is stored for 2 minutes
    function timeCheck(coin) {
        const nowTime = new Date().getTime()
        restCoin = JSON.parse(sessionStorage.getItem(`coinInfo${coin}`))
        restCoin = parseInt(restCoin.time)
        if ((nowTime - restCoin) > 120000)
            sessionStorage.removeItem(`coinInfo${coin}`)
    }
    // Displaying more info about coins: NIS, EURO, USD
    $("#homeSection").on("click", ".card > .showCoin", async function () {
        const coinId = $(this).attr("id")
        const infoDiv = document.getElementById(`${coinId}Info`)
        if (sessionStorage.getItem(`coinInfo${coinId}`) === null) {
            $(".d-flex").css("visibility", "visible")
            $("#loader").show()
            const coin = await getMoreInfo(coinId)
            $(".d-flex").css("visibility", "hidden")
            $("#loader").hide()
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
    }
    )
    // fetching "more Info" data
    async function getMoreInfo(coinId) {
        $(".d-flex").css("visibility", "visible")
        $("#loader").show()
        const coin = await getJSON("https://api.coingecko.com/api/v3/coins/" + coinId)
        $(".d-flex").css("visibility", "hidden")
        $("#loader").hide()
        return coin
    }
    // Open and close "more Info"
    function displayAndHide(infoDiv, content) {
        if (infoDiv.style.display !== "block") {
            infoDiv.innerHTML = content
            infoDiv.style.display = "block"
        }
        else if (infoDiv.style.display === "block")
            $(infoDiv).hide(1000)
    }
    // live coins search
    $("input[type=search]").on("keyup", function () {
        const textToSearch = $(this).val().toLowerCase()
        if (textToSearch === "")
            displayCoins("homeSection", coins)
        else {
            const filteredCoins = coins?.filter(coin => coin.symbol.includes(textToSearch))
            displayCoins("homeSection", filteredCoins)
        }
    }
    )
    //live chart
    let chart = new CanvasJS.Chart("liveChartContainer", {
        title: {
            text: "Live Crypto Prices"
        },
        axisY: {
            title: "Price (USD)"
        },
        axisX: {
            valueFormatString: "HH:mm:ss"
        },
        data: [],
    })
    $("#dataSection").on("click", function () {
        if (favCoins.length === 0) {
            $("#liveChartContainer").hide()
            $("#noCoinsToFollow").show()
        }
        else {
            $("#liveChartContainer").show()
            $("#noCoinsToFollow").hide()
            for (let i = 0; i < favCoins.length; i++) {
                cryptocurrencies.push((favCoins[i].symbol).toUpperCase())
            }

            for (let i = 0; i < cryptocurrencies.length; i++) {
                chart.options.data.push({
                    type: "line",
                    showInLegend: true,
                    name: cryptocurrencies[i],
                    dataPoints: []
                })
            }
        }
    })
    function updateChart() {
        $.ajax({
            url: "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + cryptocurrencies.join() + "&tsyms=USD",
            type: "GET",
            dataType: "json",
            success: function (data) {
                $(".d-flex").css("visibility", "visible")
                $("#loader").show()
                for (let i = 0; i < cryptocurrencies.length; i++) {
                    let cryptoPrice = data[cryptocurrencies[i]].USD
                    chart.options.data[i].dataPoints.push({
                        x: new Date(),
                        y: cryptoPrice
                    })
                    if (chart.options.data[i].dataPoints.length > 20) {
                        chart.options.data[i].dataPoints.shift()
                    }
                }
                $("#loader").hide()
                $(".d-flex").css("visibility", "hidden")
                chart.render()
            },
            error: function (error) {
                console.log("Error fetching data: ", error)
            }
        })
    }

    setInterval(updateChart, 2000)
    updateChart()

    //reset chart
    $("#home, #aboutUs").on("click", function () {
        cryptocurrencies.length=0
        chart = new CanvasJS.Chart("liveChartContainer", {
            title: {
                text: "Live Crypto Prices"
            },
            axisY: {
                title: "Price (USD)"
            },
            axisX: {
                valueFormatString: "HH:mm:ss"
            },
            data: [],
        })
            clearInterval(updateChart)
    })
    //scroll to top button
    window.onscroll = function() {scrollFunction()}
    function scrollFunction() {
      if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        $("#backTop").css("display","block")
      } else {
        $("#backTop").css("display","none")  
        }
    }
    $("#backTop").on("click", function() {
      document.documentElement.scrollTop = 0
    } )

}) 
