import React from 'react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import './Bookmark.css';

const Bookmark = ({ isBookmarked = false, onClick, disabled = false }) => {
    const handleClick = (e) => {
        e.stopPropagation();
        if (!disabled && onClick) {
            onClick(!isBookmarked);
        }
    };

    return (
        <button
            className={`bookmark-button ${isBookmarked ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={handleClick}
            disabled={disabled}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
            {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
        </button>
    );
};

export default Bookmark;
