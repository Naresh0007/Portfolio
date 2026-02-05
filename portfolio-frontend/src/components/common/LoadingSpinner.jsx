import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Fetching API...' }) => {
    return (
        <div className="api-loader-container">
            <div className="api-spinner-wrapper">
                <div className="api-spinner"></div>
                <div className="api-spinner-inner"></div>
            </div>
            <p className="api-loading-text">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
