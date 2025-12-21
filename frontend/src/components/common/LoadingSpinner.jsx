import './LoadingSpinner.css';

export const LoadingSpinner = ({ size = 'medium', text = '' }) => {
    return (
        <div className="spinner-container">
            <div className={`water-spinner water-spinner-${size}`}>
                <div className="water-drop"></div>
                <div className="water-drop"></div>
                <div className="water-drop"></div>
            </div>
            {text && <p className="spinner-text">{text}</p>}
        </div>
    );
};
