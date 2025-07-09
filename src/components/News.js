import React, { useEffect, useState } from 'react';
import NewsItem from './NewsItem';
import Spinner from './Spinner';
import PropTypes from 'prop-types';
import InfiniteScroll from "react-infinite-scroll-component";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useRef } from 'react';


const News = (props) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0); // Start from 0, increment before fetch
    const [totalResults, setTotalResults] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const errorToastShown = useRef(false);

    const showToastOnce = (message) => {
        if (!errorToastShown.current) {
            toast.error(message);
            errorToastShown.current = true;
        }
    };


    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const updateNews = async () => {
        props.setProgress?.(10);
        setLoading(true);
        try {
            const nextPage = 1;
            const url = `https://newsapi.org/v2/everything?q=${props.category}&apiKey=${props.apiKey}&page=${nextPage}&pageSize=${props.pageSize}&sortBy=publishedAt&language=en`;
            const data = await fetch(url);
            props.setProgress?.(30);

            if (!data.ok) {
                throw new Error(`HTTP error! status: ${data.status}`);
            }

            const parsedData = await data.json();
            props.setProgress?.(70);

            // Deduplicate
            const newArticles = parsedData.articles || [];
            const seenUrls = new Set();
            const uniqueArticles = newArticles.filter(article => {
                if (seenUrls.has(article.url)) return false;
                seenUrls.add(article.url);
                return true;
            });

            setArticles(uniqueArticles);
            setTotalResults(parsedData.totalResults || 0);
            setPage(nextPage);
            setHasMore(uniqueArticles.length < (parsedData.totalResults || 0));
        } catch (error) {
            if (error.message.includes("429")) {
                showToastOnce("You have exceeded the API request limit. Please try again later.");
                setLoading(false);
                setHasMore(false);
            } else {
                showToastOnce("Something went wrong while fetching the news.");
                console.error("Failed to fetch news:", error);
            }
        } finally {
            setLoading(false);
            props.setProgress?.(100);
        }
    };

    useEffect(() => {
        document.title = `${capitalizeFirstLetter(props.category)} - NewsMonkey`;
        updateNews();
        // eslint-disable-next-line
    }, []);

    const fetchMoreData = async () => {
        try {
            const nextPage = page + 1;
            const url = `https://newsapi.org/v2/everything?q=${props.category}&apiKey=${props.apiKey}&page=${nextPage}&pageSize=${props.pageSize}&sortBy=publishedAt&language=en`;
            const data = await fetch(url);

            if (!data.ok) {
                throw new Error(`HTTP error! status: ${data.status}`);
            }

            const parsedData = await data.json();

            // Deduplicate
            const existingUrls = new Set(articles.map(article => article.url));
            const newArticles = (parsedData.articles || []).filter(article => !existingUrls.has(article.url));

            // Append new unique articles
            setArticles(prevArticles => [...prevArticles, ...newArticles]);
            setPage(nextPage);

            // Update totalResults if changed
            setTotalResults(parsedData.totalResults || totalResults);

            // If no new unique articles or we reached totalResults, stop fetching more
            if (newArticles.length === 0 || articles.length + newArticles.length >= (parsedData.totalResults || totalResults)) {
                setHasMore(false);
            }

             // Reset error toast flag on successful fetch
            errorToastShown.current = false;


        } catch (error) {
            if (error.message.includes("429")) {
                showToastOnce("You have exceeded the API request limit. Please try again later.");
                setHasMore(false);
            } else {
                showToastOnce("Something went wrong while loading more news.");
                console.error("Failed to load more news:", error);
            }
        }


    };

    return (
        <>
            <h1 className="text-center" style={{ margin: '30px 0px', marginTop: '80px' }}>
                NewsMonkey - Showing results for “{capitalizeFirstLetter(props.category)}”
            </h1>

            {loading && <Spinner />}
            <InfiniteScroll
                dataLength={articles.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={<Spinner />}
                endMessage={
                    <p style={{ textAlign: 'center', marginTop: '20px' }}>
                        <b>Yay! You have seen all the news.</b>
                    </p>
                }
            >
                <div className="container">
                    <div className="row row-cols-1 row-cols-lg-2 row-cols-xl-3">
                        {articles.map((element) => (
                            <div className="col-mb-4" key={element.url}>
                                <NewsItem
                                    title={element.title || ""}
                                    description={element.description || ""}
                                    imageUrl={element.urlToImage}
                                    newsUrl={element.url}
                                    author={element.author}
                                    date={element.publishedAt}
                                    source={element.source.name}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </InfiniteScroll>

            {/* Toast container for notifications */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </>
    );
};

News.defaultProps = {
    country: 'in',
    pageSize: 8,
    category: 'general',
};

News.propTypes = {
    country: PropTypes.string,
    pageSize: PropTypes.number,
    category: PropTypes.string,
};

export default News;
