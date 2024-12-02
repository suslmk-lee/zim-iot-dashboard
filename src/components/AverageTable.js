import React from 'react';

const AverageTable = ({ averages }) => {
    return (
        <div className="average-table-container">
            <h2>5-Second Averages</h2>
            <table>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Sunlight</th>
                        <th>Humidity (%)</th>
                        <th>Battery (V)</th>
                    </tr>
                </thead>
                <tbody>
                    {averages.map((avg, index) => (
                        <tr key={index}>
                            <td>{avg.time}</td>
                            <td>{avg.lightQuantity}</td>
                            <td>{avg.humidity}</td>
                            <td>{avg.batteryVoltage}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AverageTable;
