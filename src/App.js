import React, { useState, useEffect, useLayoutEffect, useCallback, Component } from 'react';
import './App.css';
import ReactDOM from 'react-dom';
import ApexCharts from "apexcharts";
import ReactApexChart from "react-apexcharts";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import ApexCircleChart from "./components/ApexCircleChartComponent";
import ApexHeatmapChart from "./components/ApexHeatmapChartComponent";
import Config from "./config/config";

const App = () => {

const API_BASE_URL = Config.REACT_APP_API_BASE_URL ;
    const chartSeries = []; // realtime chart data
    const chartData1 = [];  // line 데이터 1
    const chartData2 = [];  // line 데이터 2
    const chartData3 = [];  // line 데이터 3

    const category = ['Electrical energy (kW)', 'Voltage (V)', 'Electric current (A)', 'Temperature (C)'];
    const apiTarget = ['CSP-1', 'CSP-2'];
    let selectedCategory = category[0];
    let offset = 1000 * 60 * 60 * 9 // 9시간 밀리세컨트
    let lastDate = new Date(Date.now() + offset).getTime();
    let TICKINTERVAL = 1000 // 1초 (1000 ms)
    let XAXISRANGE = 9000   // 차트에 보여주는 x축 범위

    const [stackIoTData, setStackIoTData] = useState([]);
    const [heatmapChartSeries, setHeatmapChartSeries] = useState([]);
    let circleDataCallCount = 0;

    const [intervalData, updateIntervalData] = useState([1, 1, 1]);
    useLayoutEffect(() => {
        const interval = setInterval(() => {
            let array = [...intervalData, 10];
            array.shift();
            updateIntervalData(array);
        }, TICKINTERVAL);
        return () => {
            window.clearInterval(interval);
        };
    }, [intervalData]);

    async function fetchWithTimeout(resource, options = {}) {
        const { timeout = 1000 } = options;

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            console.log('Fetching:', resource);
            const response = await fetch(resource, {
                ...options,
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: controller.signal
            });
            clearTimeout(id);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response;
        } catch (error) {
            clearTimeout(id);
            console.error('Fetch error:', error);
            throw error;
        }
    }

    async function getInitSeries(baseval) {
        var newDate = new Date(Date.now() + offset).getTime() - XAXISRANGE ;
        //console.log("init Timestamp - 9000ms :",newDate);

        try {
            /*const response = await fetchWithTimeout(`${API_BASE_URL}?milli-time=${newDate}`, {

                signal: AbortSignal.timeout(2000)
            });*/
            const response = await fetchWithTimeout(`${API_BASE_URL}/iot-data`, {
                signal: AbortSignal.timeout(1000)
            });

            if (response.ok) {
                const result = await response.json();
                if(result){
                    for (var i = 0; i < result.length; i++) {
                        stackIoTData.push(result[i]);
                        console.log("origin : ",result[i]);
                    }

                    /* backEnd update -> order by asc
                    stackIoTData.sort(function(a,b) {
                        return a.timestamp - b.timestamp
                    });
                    */
                }
            }else{
                console.error("Failed to init data from backend. Status:", response.status);
            }
        } catch (error) {
            console.error("Error init data: ", error);
        }

        console.log("getInitSeries - stackIoTData : ",stackIoTData);

    }

    function getMaxTimestamp () {
        var maxArray = [];
        var maxValue = 0;

        if (stackIoTData.length > 0){
            for (var i = 0; i < stackIoTData.length; i++) {
                maxArray.push(stackIoTData[i].timestamp);
            }
        }

        if(maxArray.length > 0){
            maxValue = Math.max.apply(null, maxArray);
        }

        return maxValue;
    }


    async function getNewSeries(baseval) {

        var newDate = baseval + TICKINTERVAL;
        lastDate = newDate
        circleDataCallCount++;
        var modIndex = (apiTarget.length-1) - (circleDataCallCount % apiTarget.length);
        var maxTimestamp = getMaxTimestamp();


        try {
            const requestTime = window.performance.now();
            const response = await fetchWithTimeout(`${API_BASE_URL}/iot-data?milli-time=${maxTimestamp}`,{
                signal: AbortSignal.timeout(2000)
            });
            const resposneTime = window.performance.now();


            if (response.ok) {
                const result = await response.json();

                /* ##### stackIoTData Start ##### */
                if(result){
                    console.log("result",true)
                    for (var i = 0; i < result.length; i++) {
                        stackIoTData.push(result[i]);
                    }
                }
                /* ##### stackIoTData End ##### */

                /* ##### realtime chart Start ##### */
                // IMPORTANT :: we reset the x and y of the data which is out of drawing area, to prevent memory leaks
                for (var i = 0; i < chartData1.length - 10; i++) {
                    chartData1[i].x = newDate - XAXISRANGE - TICKINTERVAL
                    chartData1[i].y = 0
                }
                for (var i = 0; i < chartData2.length - 10; i++) {
                    chartData2[i].x = newDate - XAXISRANGE - TICKINTERVAL
                    chartData2[i].y = 0
                }
                for (var i = 0; i < chartData3.length - 10; i++) {
                    chartData3[i].x = newDate - XAXISRANGE - TICKINTERVAL
                    chartData3[i].y = 0
                }
                //Series 데이터 초기화 (realtime)
                while(chartSeries.length) chartSeries.pop();


                switch (selectedCategory){
                    case category[0] :
                        chartData1.push({ x: newDate, y: Math.floor(stackIoTData[0].pmax) });
                        chartData2.push({ x: newDate, y: Math.floor(stackIoTData[0].pac) });
                        chartData3.push({ x: newDate, y: Math.floor(stackIoTData[0].sac) });

                        chartSeries.push({ name: 'Pmax', data: chartData1 });
                        chartSeries.push({ name: 'Pac', data: chartData2 });
                        chartSeries.push({ name: 'Sac', data: chartData3 });
                        break;
                    case category[1] :
                        chartData1.push({ x: newDate, y: Math.floor(stackIoTData[0].uab) });
                        chartData2.push({ x: newDate, y: Math.floor(stackIoTData[0].ubc) });
                        //chartData2.push({ x: newDate, y: 0 });
                        chartData3.push({ x: newDate, y: Math.floor(stackIoTData[0].uca) });

                        chartSeries.push({ name: 'Uab', data: chartData1 });
                        chartSeries.push({ name: 'Ubc', data: chartData2 });
                        chartSeries.push({ name: 'Uca', data: chartData3 });
                        break;
                    case category[2] :
                        chartData1.push({ x: newDate, y: Math.floor(stackIoTData[0].ia) });
                        chartData2.push({ x: newDate, y: Math.floor(stackIoTData[0].ib) });
                        chartData3.push({ x: newDate, y: Math.floor(stackIoTData[0].ic) });

                        chartSeries.push({ name: 'Ia', data: chartData1 });
                        chartSeries.push({ name: 'Ib', data: chartData2 });
                        chartSeries.push({ name: 'Ic', data: chartData3 });
                        break;
                    case category[3] :
                        chartData1.push({ x: newDate, y: Math.floor(stackIoTData[0].tmod) });
                        chartData2.push({ x: newDate, y: Math.floor(stackIoTData[0].tamb) });
                        //chartData3.push({ x: newDate, y: Math.floor(result.Status.Sac) });

                        chartSeries.push({ name: 'Tmod', data: chartData1 });
                        chartSeries.push({ name: 'Tamb', data: chartData2 });
                        //chartSeries.push({ name: 'Sac', data: chartData3 });
                        break;
                }
                /* ##### realtime chart End ##### */

                if(stackIoTData.length > 1){
                    stackIoTData.shift();
                }
                console.log("stackIoTData.slice : ",stackIoTData);

            }else{
                console.error("Failed to fetch data from backend. Status:", response.status);

                //Series 데이터 초기화 (realtime)
                while(chartSeries.length) chartSeries.pop();

                switch (selectedCategory){
                    case category[0] :
                        chartData1.push({ x: newDate, y: 0 });
                        chartData2.push({ x: newDate, y: 0 });
                        chartData3.push({ x: newDate, y: 0 });

                        chartSeries.push({ name: 'Pmax', data: chartData1 });
                        chartSeries.push({ name: 'Pac', data: chartData2 });
                        chartSeries.push({ name: 'Sac', data: chartData3 });
                        break;
                    case category[1] :
                        chartData1.push({ x: newDate, y: 0 });
                        chartData2.push({ x: newDate, y: 0 });
                        chartData3.push({ x: newDate, y: 0 });

                        chartSeries.push({ name: 'Uab', data: chartData1 });
                        chartSeries.push({ name: 'Ubc', data: chartData2 });
                        chartSeries.push({ name: 'Uca', data: chartData3 });
                        break;
                    case category[2] :
                        chartData1.push({ x: newDate, y: 0 });
                        chartData2.push({ x: newDate, y: 0 });
                        chartData3.push({ x: newDate, y: 0 });

                        chartSeries.push({ name: 'Ia', data: chartData1 });
                        chartSeries.push({ name: 'Ib', data: chartData2 });
                        chartSeries.push({ name: 'Ic', data: chartData3 });
                        break;
                    case category[3] :
                        chartData1.push({ x: newDate, y: 0 });
                        chartData2.push({ x: newDate, y: 0 });

                        chartSeries.push({ name: 'Tmod', data: chartData1 });
                        chartSeries.push({ name: 'Tamb', data: chartData2 });
                        break;
                }

            }

            /* ##### heatmap chart Start ##### */
            let heatmapData = {
                target: apiTarget[modIndex],
                status: response.ok,
                x: newDate - XAXISRANGE - TICKINTERVAL,
                y: response.ok ? Math.floor(resposneTime-requestTime) : -1
            };

            setHeatmapChartSeries((prevData) => [...prevData, heatmapData].slice(-120));
            /* ##### heatmap chart End ##### */

        } catch (error) {
            console.error("Error fetching data: ", error);

            //Series 데이터 초기화 (realtime)
            while(chartSeries.length) chartSeries.pop();

            switch (selectedCategory){
                case category[0] :
                    chartData1.push({ x: newDate, y: 0 });
                    chartData2.push({ x: newDate, y: 0 });
                    chartData3.push({ x: newDate, y: 0 });

                    chartSeries.push({ name: 'Pmax', data: chartData1 });
                    chartSeries.push({ name: 'Pac', data: chartData2 });
                    chartSeries.push({ name: 'Sac', data: chartData3 });
                    break;
                case category[1] :
                    chartData1.push({ x: newDate, y: 0 });
                    chartData2.push({ x: newDate, y: 0 });
                    chartData3.push({ x: newDate, y: 0 });

                    chartSeries.push({ name: 'Uab', data: chartData1 });
                    chartSeries.push({ name: 'Ubc', data: chartData2 });
                    chartSeries.push({ name: 'Uca', data: chartData3 });
                    break;
                case category[2] :
                    chartData1.push({ x: newDate, y: 0 });
                    chartData2.push({ x: newDate, y: 0 });
                    chartData3.push({ x: newDate, y: 0 });

                    chartSeries.push({ name: 'Ia', data: chartData1 });
                    chartSeries.push({ name: 'Ib', data: chartData2 });
                    chartSeries.push({ name: 'Ic', data: chartData3 });
                    break;
                case category[3] :
                    chartData1.push({ x: newDate, y: 0 });
                    chartData2.push({ x: newDate, y: 0 });

                    chartSeries.push({ name: 'Tmod', data: chartData1 });
                    chartSeries.push({ name: 'Tamb', data: chartData2 });
                    break;
            }

            /* ##### heatmap chart Start ##### */
            let heatmapData = {
                target: apiTarget[modIndex],
                status: false,
                x: newDate - XAXISRANGE - TICKINTERVAL,
                y: -1
            };

            setHeatmapChartSeries((prevData) => [...prevData, heatmapData].slice(-120));
            /* ##### heatmap chart End ##### */
        }
    }


    class ApexChart extends React.Component {

        constructor(props) {
            super(props);

            this.state = {
                series: chartSeries.slice(),
                options: {
                    chart: {
                        id: 'realtime',
                        height: 350,
                        type: 'line',
                        animations: {
                            enabled: true,
                            easing: 'linear',
                            animateGradually: {
                                enabled: true,
                                delay: 150
                            },
                            dynamicAnimation: {
                                speed: TICKINTERVAL
                            }
                        },
                        toolbar: {
                            show: false
                        },
                        zoom: {
                            enabled: false
                        }
                    },
                    stroke: {
                        curve: 'smooth'
                    },
                    /*title: {
                        text: 'Dynamic Updating Chart',
                        align: 'left'
                    },*/
                    markers: {
                        size: 0
                    },
                    xaxis: {
                        type: 'datetime',
                        range: XAXISRANGE,
                        //categories: totalData?.map((item) => item.x), //X축 데이터(Date)
                    },
                    //yaxis: [{show: true},{show: true},{show: true}],
                    legend: {
                        show: true
                    },
                    theme: {
                        palette: 'palette1',
                    }
                },
                selectedButton: category[0]

            };
        }

        componentDidMount() {
            getInitSeries(lastDate);

            window.setInterval(() => {
                getNewSeries(lastDate);
                ApexCharts.exec('realtime', 'updateSeries', chartSeries)

            }, TICKINTERVAL)
        }

        changeLabel = () => {

            const chartButtom = document.querySelector('#chartButtom');
            const heatmapChart = document.querySelector('#heatmapChart');
            const circleChart = document.querySelector('#circleChart');

            if(heatmapChart.style.display === "none"){
                chartButtom.style.display = 'block';
                heatmapChart.style.display = 'block';
                circleChart.style.display = 'block';
            }else{
                chartButtom.style.display = 'none';
                heatmapChart.style.display = 'none';
                circleChart.style.display = 'none';
            }
        };

        changeButton = (button) => {

            selectedCategory = button;
            switch (selectedCategory){
                case category[0] :
                    this.setState({
                        options: {
                            theme: {
                                palette: 'palette1',
                            }
                        },
                        selectedButton: button
                    });
                    break;
                case category[1] :
                    this.setState({
                        options: {
                            theme: {
                                palette: 'palette2',
                            }
                        },
                        selectedButton: button
                    });
                    break;
                case category[2] :
                    this.setState({
                        options: {
                            theme: {
                                palette: 'palette3',
                            }
                        },
                        selectedButton: button
                    });
                    break;
                case category[3] :
                    this.setState({
                        options: {
                            theme: {
                                palette: 'palette4',
                            }
                        },
                        selectedButton: button
                    });
                    break;
            }
        };



        render() {
            return (
                <div>
                    <div className="chartButton">
                        <ButtonGroup variant="outlined">
                            {
                                category.map(button => (<Button key={button} onClick={() => this.changeButton(button) } variant={this.state.selectedButton === button ? 'contained' : 'outlined'}>{button}</Button>))
                            }
                        </ButtonGroup>
                    </div>
                    <div className="chartSwitch">
                        <FormControlLabel control={<Switch onClick={() => this.changeLabel() } />} label="Network Info"  />
                    </div>
                    <div className="chart">
                        <ReactApexChart options={this.state.options} series={this.state.series} type="line" height={350}/>
                    </div>
                    <div id="html-dist"></div>
                </div>


            );
        }
    }

    useLayoutEffect(() => {
        //realtime chart render
        ReactDOM.render(React.createElement(ApexChart), document.querySelector('#apexchartDom'));
    }, []);

    return (
        <div className="main-container">
            <h1 className="title">K-PaaS Real-Time IoT Data</h1>
            <div className="table-container" id="apexchartDom" />

            {/* 하단 - 5초 단위 그래프 및 테이블 */}
            <div className="table-container" id="chartButtom" style={{display: 'none'}}>
                <div className="average-content-container">
                    <div className="average-chart-container">
                        <div id="heatmapChart" style={{display: 'none'}}>
                            <ApexHeatmapChart data={heatmapChartSeries}/>
                        </div>
                    </div>
                    <div className="average-table-container">
                        <div id="circleChart" style={{display: 'none'}}>
                            <ApexCircleChart data={heatmapChartSeries}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default App;
