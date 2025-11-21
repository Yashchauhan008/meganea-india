import React from 'react';

const DashboardPage = () => {
    return (
        <div>
            {/* 
              THIS IS THE FIX:
              - `text-text` applies the default dark text color in light mode.
              - `dark:text-dark-text` applies the light text color in dark mode.
            */}
            <h1 className="text-3xl font-bold text-text dark:text-dark-text">
                India Dashboard
            </h1>
        </div>
    );
};

export default DashboardPage;
