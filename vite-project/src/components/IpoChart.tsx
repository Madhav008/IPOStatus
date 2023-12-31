import { FC, useEffect } from 'react'
import Chart from "react-apexcharts";
interface IpoChartProps {
    name: string;
    chartdata: any;
}

const IpoChart: FC<IpoChartProps> = ({ name, chartdata }) => {

    const chart: any = {
        options: {
            // enable and customize data labels using the following example, learn more from here: https://apexcharts.com/docs/datalabels/
            dataLabels: {
                enabled: false,
                // offsetX: 10,
                style: {
                    cssClass: 'text-xs text-white font-medium'
                },
            },
            grid: {
                show: false,
                strokeDashArray: 4,
                padding: {
                    left: 16,
                    right: 16,
                    top: -7
                },
            },
            chart: {
                height: "80%",
                maxWidth: "50%",
                type: "area",
                fontFamily: "Inter, sans-serif",
                dropShadow: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            tooltip: {
                enabled: true,
                x: {
                    show: false,
                },
            },
            legend: {
                show: true
            },
            fill: {
                type: "gradient",
                gradient: {
                    opacityFrom: 0.55,
                    opacityTo: 0,
                    shade: "#1C64F2",
                    gradientToColors: ["#1C64F2"],
                },
            },
            stroke: {
                width: 6,
            },
            xaxis: {
                categories: chartdata.map((item: any) => item.date),
                labels: {
                    show: false,
                },
                axisBorder: {
                    show: true,
                },
                axisTicks: {
                    show: true,
                },
            },
            yaxis: {
                show: true,
                labels: {
                    formatter: function (value: any) {
                        return '₹' + value;
                    },
                    style: {
                        colors: '#ffffff',
                        fontFamily: 'Inter, sans-serif' // Set the font family as needed
                    }
                }
            },

        },
        series: [
            {
                name: "Price",
                data: chartdata.map((item: any) => item.premium),
                color: "#7E3BF2",

            },
        ]
    }
    useEffect(() => {

    }, [])

    return (

        <div className="rounded-lg shadow p-4 md:p-6 w-full">
            <div className="flex justify-between mb-5">
                <div>
                    <h5 className="leading-none text-3xl font-bold  text-white pb-2">₹{chartdata.map((item: any) => item.premium)[chartdata.map((item: any) => item.premium).length - 1]}</h5>
                    <p className="text-base font-normal text-gray-400 ">{name}</p>
                </div>
                {/* <div
                    className="flex items-center px-2.5 py-0.5 text-base font-semibold text-green-500  text-center">
                    23%
                    <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13V1m0 0L1 5m4-4 4 4" />
                    </svg>
                </div> */}
            </div>
            <div id="data-labels-chart ">
                <Chart
                    height="250px"
                    options={chart.options}
                    series={chart.series}
                    type="area" />
            </div>

        </div>



    )
}

export default IpoChart