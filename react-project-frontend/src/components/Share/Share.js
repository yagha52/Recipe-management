import React, { useState } from 'react';
import { FaFacebook, FaTwitter, FaWhatsapp, FaEnvelope, FaInstagram, FaPinterest, FaLink } from 'react-icons/fa';
import './Share.css';

const Share = ({ url, title, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const shareData = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
        email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check this out: ${url}`)}`,
        instagram: `https://www.instagram.com/`, 
        pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
    };

    const handleShare = (e, platform) => {
        e.stopPropagation();
        if (disabled) return;

        const shareUrl = shareData[platform];
        window.open(shareUrl, '_blank', 'width=600,height=400');
        setIsOpen(false);
    };

    const handleCopyLink = async (e) => {
        e.stopPropagation();
        if (disabled) return;

        try {
            await navigator.clipboard.writeText(url);
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            setCopySuccess('Failed to copy!');
        }
        setIsOpen(false);
    };

    const toggleMenu = (e) => {
        e.stopPropagation();
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className="share-container">
            <button
                className={`share-button ${disabled ? 'disabled' : ''}`}
                onClick={toggleMenu}
                disabled={disabled}
                aria-label="Share"
                title="Share"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
            </button>

            {isOpen && (
                <div className="share-menu">
                    <button onClick={(e) => handleShare(e, 'facebook')} className="share-option facebook">
                        <FaFacebook /> Facebook
                    </button>
                    <button onClick={(e) => handleShare(e, 'twitter')} className="share-option twitter">
                        <FaTwitter /> Twitter
                    </button>
                    <button onClick={(e) => handleShare(e, 'whatsapp')} className="share-option whatsapp">
                        <FaWhatsapp /> WhatsApp
                    </button>
                    <button onClick={(e) => handleShare(e, 'email')} className="share-option email">
                        <FaEnvelope /> Email
                    </button>
                    <button onClick={(e) => handleShare(e, 'instagram')} className="share-option instagram">
                        <FaInstagram /> Instagram
                    </button>
                    <button onClick={(e) => handleShare(e, 'pinterest')} className="share-option pinterest">
                        <FaPinterest /> Pinterest
                    </button>
                    <button onClick={handleCopyLink} className="share-option copylink">
                        <FaLink /> {copySuccess || 'Copy Link'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Share;
