// On window load get global statistics of COVID-19
$(document).ready(function () {
    $.ajax({
        url: 'https://disease.sh/v3/covid-19/all',
        dataType: 'json',
        success: function (results) {
            // Set stats to variables
            let infectedInt = results.cases;
            let deathsInt = results.deaths;
            let recoveredInt = results.recovered;

            // Display the values
            $(".infectedInt").text(infectedInt.toLocaleString());
            $(".deathsInt").text(deathsInt.toLocaleString());
            $(".recoveredInt").text(recoveredInt.toLocaleString());
        }
    });
});

const ctx = document.getElementById("worldwideGraph").getContext('2d');
const historyURL = 'https://disease.sh/v3/covid-19/historical/all?lastdays=180';

$("#graphToggler").on('click', function () {

    if ($(this).hasClass('arrowDown')) {
        $(this).removeClass('arrowDown');
        $(this).addClass('arrowUp');
        $("#showGraph").text("Hide Global Graph");
        $('.chartContainer').show();

    } else {

        $(this).removeClass('arrowUp');
        $(this).addClass('arrowDown');
        $("#showGraph").text("Show Global Graph");
        $('.chartContainer').hide();
    }
})

$(".chartContainer").hide();

// Get the history of worldwide stats
$(document).ready(function () {
    $.ajax({
        url: historyURL,
        dataType: 'json',
        success: function (data) {
            let globalCases = Object.values(data.cases);
            let globalDeaths = Object.values(data.deaths);
            let globalRecovered = Object.values(data.recovered);
            let globalTimeline = Object.keys(data.deaths);
            let newTimes = [];
            // Convert date time from MM/DD/YYYY to Month Date using moment.js
            for (var i = 0; i < globalTimeline.length; i++) {
                newTimes.push(moment(globalTimeline[i]).format('MMM D'))
            }
            drawChart(globalCases, globalDeaths, globalRecovered, newTimes);
        }
    });
})


function drawChart(cases, deaths, recovered, timeline) {
    const countryChart = new Chart(ctx, {
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
                text: "Pandemic worldwide statistics (last 180 days)"
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

// Draw the chart
drawChart();