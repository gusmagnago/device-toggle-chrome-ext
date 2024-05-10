import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

import { Container } from '@mui/material';

// Page not in use
function PrivacyPolicy() {
  const [policyText, setPolicyText] = useState('');

  useEffect(() => {
    fetch('/privacyPolicy.md')
      .then((response) => response.text())
      .then((text) => {
        setPolicyText(text.replace('[!NOTE]', ''));
      })
      .catch((error) => {
        console.error('Error fetching privacy policy:', error);
        setPolicyText(error);
      });
  }, []);

  return (
    <Container fixed>
      <ReactMarkdown>{policyText}</ReactMarkdown>
    </Container>
  );
}

export default PrivacyPolicy;
