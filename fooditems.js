import React, { useEffect, useState } from "react";
import { Container, ListGroup } from "react-bootstrap";
import HtmlParse from "./HtmlParse";
import { HashRouter as Router, Link, Routes, Route } from "react-router-dom";
import { useParams } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

const Content = ({ data, htmlContent }) => {
  const { filename } = useParams();
  const selectedPage = data.foodPages.find(
    (page) => page.filename === filename
  );
  const selectedContent = selectedPage ? htmlContent[selectedPage.title] : null;

  return (
    <div>
      {selectedPage && selectedContent && (
        <div>
          <HtmlParse html={selectedContent} />
        </div>
      )}
    </div>
  );
};

export default function FoodItems() {
  const [data, setData] = useState({ foodPages: [] });
  const [htmlContent, setHtmlContent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          process.env.PUBLIC_URL + "/foodmarket.json"
        );
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchHtmlContent = async () => {
      const htmlContentMap = {};
      await Promise.all(
        data.foodPages.map(async (page) => {
          try {
            const htmlResponse = await fetch(
              process.env.PUBLIC_URL + `/${page.filename}`
            );
            const htmlData = await htmlResponse.text();
            htmlContentMap[page.title] = htmlData;
          } catch (error) {
            console.error(`Error fetching HTML for ${page.title}:`, error);
          }
        })
      );

      setHtmlContent(htmlContentMap);
    };

    // Fetch HTML content only if there is data available
    if (data.foodPages.length > 0) {
      // Immediately-invoked function expression (IIFE) to use async function in useEffect
      (async () => {
        await fetchHtmlContent();
      })();
    }
  }, [data.foodPages]);

  // Render component only if HTML content is available
  if (!htmlContent) {
    return null;
  }

  return (
    <Router>
      <Container>
        <ListGroup>
          {data.foodPages.map((page) => (
            <ListGroup.Item
              key={page.filename}
              className="d-flex justify-content-between align-items-start"
            >
              <Link to={`/${page.filename}`} className="ms-2 me-auto">
                {page.title}
              </Link>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <Routes>
          <Route
            path="/"
            element={
              <div>
                <h2>Home Page</h2>
                {/* Optionally, you can render some content for the home page */}
              </div>
            }
          />
          <Route
            path="/:filename"
            element={
              <div className="mt-3">
                <Content data={data} htmlContent={htmlContent} />
              </div>
            }
          />
        </Routes>
      </Container>
    </Router>
  );
}
