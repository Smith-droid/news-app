import React from 'react';

const NewsItem = (props) => {
    let { title, description, imageUrl, newsUrl, author, date, source } = props;

    // Helper function to truncate text
    const truncateText = (text, maxLength) => {
        return text && text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    };

    return (
        <div className="my-3">
            <div className="card h-100" style={{ height: '420px', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    position: 'absolute',
                    right: '0',
                    top: '0',
                    zIndex: '1'
                }}>
                    <span className="badge rounded-pill bg-danger"> {source} </span>
                </div>

                <img
                    src={imageUrl || "https://fdn.gsmarena.com/imgroot/news/21/08/xiaomi-smart-home-india-annoucnements/-476x249w4/gsmarena_00.jpg"}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://fdn.gsmarena.com/imgroot/news/21/08/xiaomi-smart-home-india-annoucnements/-476x249w4/gsmarena_00.jpg";
                    }}
                    className="card-img-top"
                    alt="news"
                    style={{ height: '180px', objectFit: 'cover' }}
                />

                <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                        <h5 className="card-title">{truncateText(title, 60)}</h5>
                        <p className="card-text">{truncateText(description, 100)}</p>
                    </div>
                    <div>
                        <p className="card-text">
                            <small className="text-muted">By {!author ? "Unknown" : author} on {new Date(date).toGMTString()}</small>
                        </p>
                        <a rel="noreferrer" href={newsUrl} target="_blank" className="btn btn-sm btn-dark">
                            Read More
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsItem;
