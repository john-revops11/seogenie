
import React from 'react';

const CaseStudyStyles: React.FC = () => {
  return (
    <style jsx global>{`
      .case-study-section {
        display: flex;
        flex-wrap: wrap;
        gap: 1.5rem;
        margin: 1.5rem 0;
      }
      
      .left-column, .right-column {
        flex: 1;
        min-width: 250px;
        padding: 1.5rem;
        background-color: rgba(0, 0, 0, 0.02);
        border-radius: 0.5rem;
      }
      
      .case-study-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin: 1.5rem 0;
      }
      
      .grid-item {
        padding: 1.5rem;
        background-color: rgba(0, 0, 0, 0.02);
        border-radius: 0.5rem;
      }
      
      .numbered-section {
        margin: 1.5rem 0;
        padding-left: 1rem;
        border-left: 2px solid #e2e8f0;
      }
      
      .results-section {
        margin: 1.5rem 0;
        padding: 1.5rem;
        background-color: rgba(0, 0, 0, 0.02);
        border-radius: 0.5rem;
      }
      
      .results-section h3 {
        color: #2563eb;
        margin-bottom: 0.75rem;
      }
    `}</style>
  );
};

export default CaseStudyStyles;
