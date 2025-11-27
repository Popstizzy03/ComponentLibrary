// on mount
import { useState, useEffect } from "react";

export default function pageTitle() {
  const [pageTitle, setPageTitle] = useState("");

  useEffect(() => {
    setPageTitle(document.title)
  }, []);

  return <p>page title: {pageTitle}</p>
}
