import { useState, useEffect } from 'react';

export default function PreLoader({ children }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className={`pre-loader ${hidden ? 'pre-loader-hidden' : ''}`} aria-hidden="true">
        <div className="box1" />
        <div className="box2" />
        <div className="box3" />
        <div className="box4" />
        <div className="box5" />
      </div>
      {children}
    </>
  );
}
