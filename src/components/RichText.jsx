import React, { useMemo } from 'react';
import { renderRichContent } from '../services/richContent.js';

export const RichText = React.memo(function RichText({ content, className = '', style = {}, tag: Tag = 'span' }) {
  const renderedHTML = useMemo(() => {
    if (!content) return '';
    return renderRichContent(content);
  }, [content]);

  return (
    <Tag
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: renderedHTML }}
    />
  );
});

export default RichText;
