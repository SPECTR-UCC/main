
/*DASHBOARD  PIE CHART*/
var ctx = document.getElementById('chart2').getContext('2d');
var chart2 = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Item 1', 'Rarely', 'Item 3', 'Daily', 'After an incident'],
        datasets: [{
            data: [2, 2, 30, 20, 44],
            backgroundColor: ['#101010', '#202020', '#2f2f2f', '#3f3f3f', '#09DCB1'],
            hoverBackgroundColor: ['#101010', '#202020', '#2f2f2f', '#3f3f3f', '#09DCB1']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            datalabels: false
        }
    },
    plugins: [ChartDataLabels]
});
