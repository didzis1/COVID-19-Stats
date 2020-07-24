// Empty array of countries
let country_list = [];
// Push all countries to array that are available in API
$(document).ready(function () {
    $.ajax({
        url: 'https://disease.sh/v3/covid-19/countries',
        dataType: 'json',
        success: function (results) {

            for (let i = 0; i < results.length; i++) {
                country_list.push(results[i].country);
            }
        }
    });
});

// Autocomplete for input box
$("#countries").autocomplete({
    minLength: 1,
    source: function (req, res) {
        let matchLetters = new RegExp("^" + $.ui.autocomplete.escapeRegex(req.term), "i");
        res($.grep(country_list, function (word) {
            return matchLetters.test(word);
        }));
    }
});

// On submit prevent sending and collect value of the input box
document.getElementById('countryForm').addEventListener("submit", function (event) {
    event.preventDefault();
    let selectedCountry = document.countryForm.country.value;
    let allowedCharacters = /^[a-zA-Z\s\(|\)\.\']+$/;
    // First check if the input matches the regex
    if (selectedCountry.match(allowedCharacters)) {
        // Check if the input country matches a country in the array
        if (country_list.includes(selectedCountry)) {
            // Call function to display country statistics
            document.getElementById("validatorMessage").innerHTML = "";
            displayCountryStats(selectedCountry);
            countryGraph(selectedCountry);
        } else {
            return false;
        }
    } else {
        // Error message if there are any numbers, symbols etc.
        document.getElementById("validatorMessage").innerHTML = "Only allowed letters.";
    }
});


function displayCountryStats(selectedCountry) {
    let countryURL = "https://disease.sh/v3/covid-19/countries/" + selectedCountry;
    countryURL = countryURL.replace(" ", "%20");
    countryURL = countryURL.replace("(", "%28");
    countryURL = countryURL.replace(")", "%29");
    $.ajax({
        url: countryURL,
        dataType: 'json',
        success: function (result) {
            // Output the results for the specific country
            let outputCountryStats = `
                <img src=${result.countryInfo.flag}>
                <h3>${selectedCountry}</h3>
                <h4>statistics are:</h4>
                <div id="currentCases">
                <div class="con1">
                    <span class="infectedText">Total Cases</span>
                    <span class="countryInfectedInt">${result.cases.toLocaleString()}</span>
                </div>
                <div class="con2">
                    <span class="deathsText">Total Deaths</span>
                    <span class="countryDeathsInt">${result.deaths.toLocaleString()}</span>
                </div>
                <div class="con3">
                    <span class="recoveredText">Recoveries</span>
                    <span class="countryRecoveredInt">${result.recovered.toLocaleString()}</span>
                </div>
            </div>
                `;
            document.getElementById("searchOutput").innerHTML = outputCountryStats;
        }
    })
}


// Get specific country history data
function countryGraph(selectedCountry) {
    let urlCountry = 'https://disease.sh/v3/covid-19/historical/' + selectedCountry + '?lastdays=180';
    urlCountry = urlCountry.replace(" ", "%20");
    urlCountry = urlCountry.replace("(", "%28");
    urlCountry = urlCountry.replace(")", "%29");
    $.ajax({
        url: urlCountry,
        dataType: 'json',
        success: function (results) {
            let countryCases = Object.values(results.timeline.cases);
            let countryDeaths = Object.values(results.timeline.deaths);
            let countryRecovered = Object.values(results.timeline.recovered);
            let countryTimeline = Object.keys(results.timeline.cases);

            let newTimes = [];
            // Convert date time from MM/DD/YYYY to Month Date using moment.js
            for (var i = 0; i < countryTimeline.length; i++) {
                newTimes.push(moment(countryTimeline[i]).format('MMM D'))
            }

            drawHistoryChart(countryCases, countryDeaths, countryRecovered, newTimes, selectedCountry);
        }
    })
}



const ctx2 = document.getElementById("searchGraph").getContext('2d');


function drawHistoryChart(cases, deaths, recovered, timeline, countryName) {
    // Prevent from old chart showing on new chart
    if (window.countryHistoryChart != undefined) {
        window.countryHistoryChart.destroy();
    }
    window.countryHistoryChart = new Chart(ctx2, {
        datasetFill: true,
        type: 'line',
        data: {
            fill: false,
            labels: timeline,
            datasets: [{
                    label: 'Cases',
                    data: cases,
                    pointRadius: 0,
                    borderWidth: 5,
                    borderColor: 'rgb(54, 193, 240)',
                    fill: false
                },
                {
                    label: 'Deaths',
                    data: deaths,
                    pointRadius: 0,
                    borderWidth: 5,
                    borderColor: 'rgb(235, 38, 38)',
                    fill: false
                },
                {
                    label: 'Recovered',
                    data: recovered,
                    pointRadius: 0,
                    borderWidth: 5,
                    borderColor: 'rgb(46, 187, 46)',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: "Statistics for " + countryName + " (last 180 days)"
            },
            tooltips: {
                displayColors: false,
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function (item, data) {
                        return data.datasets[item.datasetIndex]["label"] + ": " + data.datasets[item.datasetIndex].data[item.index].toLocaleString();
                    }
                }
            },
            hover: {
                mode: 'index',
                intersect: false
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        userCallback: function (value, index, values) {
                            value = value.toLocaleString();
                            return value;
                        }
                    }
                }],
                xAxes: [{
                    ticks: {
                        type: 'time',
                        autoskip: true,
                        maxTicksLimit: 6,
                        maxRotation: 0,
                        minRotation: 0,
                        callback: function (value, index, values) {
                            let months = value.substring(0, 3);
                            return months;
                        }

                    }
                }]
            }
        }
    })
}
