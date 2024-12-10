import ReactApexCircleChart from "react-apexcharts";
import React, {useEffect,useLayoutEffect, useState} from "react";

const ApexCircleChart = React.memo(function ApexCircleChart(props) {

    const apiTarget = ['CSP-1', 'CSP-2'];
    const [circleChartSeries, setCircleChartSeries] = useState([100, 0, 0, 0, 0]);
    useLayoutEffect(() => {
        let totalCnt = props.data.length;
        let csp1SuccessCnt = props.data?.filter((item) => item.target === apiTarget[0] && item.status).length;
        let csp1FailCnt = props.data?.filter((item) => item.target === apiTarget[0] && !item.status).length;
        let csp2SuccessCnt = props.data?.filter((item) => item.target === apiTarget[1] && item.status).length;
        let csp2FailCnt = props.data?.filter((item) => item.target === apiTarget[1] && !item.status).length;
        //console.log("naverSuccessCnt:",naverSuccessCnt);

        setCircleChartSeries([
            100,
            totalCnt === 0 ? 0 : Math.round(csp1SuccessCnt/totalCnt*100),
            totalCnt === 0 ? 0 : Math.round(csp2SuccessCnt/totalCnt*100),
            totalCnt === 0 ? 0 : Math.round(csp1FailCnt/totalCnt*100),
            totalCnt === 0 ? 0 : Math.round(csp2FailCnt/totalCnt*100)
        ])
    }, [props.data]);


    //console.log("circleChartSeries : ",circleChartSeries);
    const series = circleChartSeries;
    const options = {
        chart: {
            height: 350,
            type: 'radialBar',
            animations: {
                enabled: false,
            }
        },
        dataLabels: {
            enabled: false
        },
        plotOptions: {
            radialBar: {
                dataLabels: {
                    name: {
                        fontSize: '22px',
                    },
                    value: {
                        fontSize: '16px',
                    },
                    total: {
                        show: true,
                        label: 'LoadBalance',
                        formatter: function (w) {
                            // By default this function returns the average of all series. The below is just an example to show the use of custom formatter function
                            return ' '
                        }
                    }
                }
            }
        },
        labels: ['Total', apiTarget[0]+' Success', apiTarget[1]+' Success', apiTarget[0]+' Fail', apiTarget[1]+' Fail'],
        legend: {
            show: true,
            position: 'bottom'
        },
    }



    /*
    const options = {
        chart: {
            id: 'radialBar',
            height: 350,
            type: 'radialBar',
        },
        plotOptions: {
            radialBar: {
                offsetY: 0,
                startAngle: 0,
                endAngle: 270,
                hollow: {
                    margin: 5,
                    size: '30%',
                    background: 'transparent',
                    image: undefined,
                },
                dataLabels: {
                    name: {
                        show: false,
                    },
                    value: {
                        show: false,
                    }
                },
                barLabels: {
                    enabled: true,
                    useSeriesColors: true,
                    offsetX: -8,
                    fontSize: '16px',
                    formatter: function(seriesName, opts) {
                        return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
                    },
                },
            }
        },
        colors: ['#1ab7ea', '#0084ff', '#39539E'],
        labels: ['Total', 'NAVER', 'NHN']
    }
    */



    return (
        <div id="chart2">
            <ReactApexCircleChart
                options={options}
                series={series}
                type="radialBar"
                width="100%"
                height="300px"/>
            <div></div>
            {/*<div style={{textAlign: 'center'}}>
                <span style={{color: '#00E396'}}>{apiTarget[0]} Success: {circleChartSeries[1]}%   </span>
                <span style={{color: '#FEB019'}}>{apiTarget[1]} Success: {circleChartSeries[2]}% </span>
            </div>
            <div style={{textAlign: 'center'}}>
                <span style={{color: '#FF4560'}}>{apiTarget[0]} Fail: {circleChartSeries[3]}% </span>
                <span style={{color: '#775DD0'}}>{apiTarget[1]} Fail: {circleChartSeries[4]}% </span>
            </div>*/}
        </div>
    );
})

export default React.memo(ApexCircleChart);