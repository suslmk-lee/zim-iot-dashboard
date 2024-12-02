import ReactApexCircleChart from "react-apexcharts";
import React, {useEffect, useState} from "react";

function ApexHeatmapChart(props) {

    const apiTarget = ['CSP-1', 'CSP-2'];
    const [heatmapChartData1, setHeatmapChartData1] = useState([]);
    const [heatmapChartData2, setHeatmapChartData2] = useState([]);

    useEffect(() => {
        //console.log(props.data);

        if(props.data?.filter((item) => item.target === apiTarget[0]).length < 20){
            var series1 = props.data?.filter((item) => item.target === apiTarget[0])
            var i = series1.length;
            while (i < 20) {
                series1.push({x: i, y: 0});
                i++;
            }
            setHeatmapChartData1(series1);
        }else{
            setHeatmapChartData1(props.data?.filter((item) => item.target === apiTarget[0]).slice(-59));
        }

        if(props.data?.filter((item) => item.target === apiTarget[1]).length < 20){
            var series2 = props.data?.filter((item) => item.target === apiTarget[1])
            var j = series2.length;
            while (j < 20) {
                series2.push({x: j, y: 0});
                j++;
            }
            setHeatmapChartData2(series2);
        }else{
            setHeatmapChartData2(props.data?.filter((item) => item.target === apiTarget[1]).slice(-59));
        }

    }, [props.data]);

    const series = [
        {
            name: apiTarget[0],
            data: heatmapChartData1.slice(40,59)
        },
        {
            name: apiTarget[0],
            data: heatmapChartData1.slice(20,39)
        },
        {
            name: apiTarget[0],
            data: heatmapChartData1.slice(0,19)
        }
    ];

    const series2 = [
        {
            name: apiTarget[1],
            data: heatmapChartData2.slice(40,59)
        },
        {
            name: apiTarget[1],
            data: heatmapChartData2.slice(20,39)
        },
        {
            name: apiTarget[1],
            data: heatmapChartData2.slice(0,19)
        }
    ];
    const options = {
        chart: {
            height: 350,
            type: 'heatmap',
            toolbar: {
                show: false
            },
            animations: {
                enabled: false,
            }
        },
        stroke: {
            width: 0
        },

        //colors: ["#008FFB","#BAFF29"],
        plotOptions: {
            heatmap: {
                shadeIntensity: 0.5,
                radius: 5,
                enableShades: false,
                useFillColorAsStroke: false,
                colorScale: {
                    ranges: [{
                            name: '응답속도(ms)',
                            from: 0,
                            to: 0,
                            color: '#FFFFFF'
                        },
                        {
                            name: 'Fast',
                            from: 1,
                            to: 100,
                            color: '#008FFB'
                        },
                        {
                            name: 'Normal',
                            from: 101,
                            to: 500,
                            color: '#00E396'
                        },
                        {
                            name: 'Slow',
                            from: 501,
                            to: 2000,
                            color: '#FE9A2E'
                        },
                        {
                            name: 'Failed',
                            from: -50,
                            to: -1,
                            color: '#FF0000'
                        },
                    ],
                },

            }
        },
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#fff']
            }
        },
        xaxis: {
            type: 'datetime',
            labels: {
                show: false,
            }
        },
        legend: {
            show: false,
        }
        /*title: {
            text: 'HeatMap Chart (Single color)'
        },*/
    }

    const options2 = {
        chart: {
            height: 350,
            type: 'heatmap',
            toolbar: {
                show: false
            },
            animations: {
                enabled: false,
            }
        },
        stroke: {
            width: 0
        },

        //colors: ["#008FFB","#BAFF29"],
        plotOptions: {
            heatmap: {
                shadeIntensity: 0.5,
                radius: 5,
                enableShades: false,
                useFillColorAsStroke: false,
                colorScale: {
                    ranges: [{
                        name: '응답속도(ms)',
                        from: 0,
                        to: 0,
                        color: '#FFFFFF'
                    },
                        {
                            name: 'Fast',
                            from: 1,
                            to: 100,
                            color: '#008FFB'
                        },
                        {
                            name: 'Normal',
                            from: 101,
                            to: 500,
                            color: '#00E396'
                        },
                        {
                            name: 'Slow',
                            from: 501,
                            to: 2000,
                            color: '#FE9A2E'
                        },
                        {
                            name: 'Failed',
                            from: -50,
                            to: -1,
                            color: '#FF0000'
                        },
                    ],
                },

            }
        },
        dataLabels: {
            enabled: true,
            style: {
                colors: ['#fff']
            }
        },
        xaxis: {
            type: 'datetime',
            labels: {
                show: false,
            }
        },
        legend: {
            show: true,
            position: 'bottom'
        }
        /*title: {
            text: 'HeatMap Chart (Single color)'
        },*/
    }




    return (
        <div id="heatmapChart">
            <ReactApexCircleChart
                options={options}
                series={series}
                type="heatmap"
                width="100%"
                height="120px" />

            <ReactApexCircleChart
                options={options2}
                series={series2}
                type="heatmap"
                width="100%"
                height="140px" />
        </div>
    );
}

export default React.memo(ApexHeatmapChart);
